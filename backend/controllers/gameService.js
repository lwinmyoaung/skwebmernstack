const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const cheerio = require('cheerio');
const Setting = require('../models/Setting');

// @desc    Check game user ID/Nickname
// @route   POST /api/v1/game/check-user
// @access  Public
exports.checkUser = async (req, res, next) => {
  try {
    const { game, game_id, server_id } = req.body;

    if (!game || !game_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide game and game_id',
      });
    }

    // 1. Get Settings
    const baseUrlSetting = await Setting.findOne({ key: 'so_miniapp_base_uri' });
    const cookieSetting = await Setting.findOne({ key: 'so_miniapp_cookie' });
    const timeoutSetting = await Setting.findOne({ key: 'so_miniapp_timeout' });

    // Use default if setting not found or is empty string
    let baseUrl = (baseUrlSetting && baseUrlSetting.value) ? baseUrlSetting.value : 'https://so.miniapp.zone';
    const cookieString = cookieSetting ? cookieSetting.value : '';
    const timeout = (timeoutSetting && timeoutSetting.value) ? parseInt(timeoutSetting.value) * 1000 : 15000;

    // Normalize Base URL (remove trailing slash)
    baseUrl = baseUrl.replace(/\/+$/, '');

    console.log(`[GameCheck] Game: ${game}, ID: ${game_id}, Server: ${server_id}`);

    // 2. Setup Axios with Cookie Jar
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    // 3. Pre-fetch shop page to get CSRF token and set initial cookies
    const shopPath = game === 'mlbb' ? '/shop/mlbb' : (game === 'pubg' ? '/shop/pubg' : (game === 'mcgg' ? '/shop/mcgg' : `/shop/${game}`));
    const shopUrl = `${baseUrl}${shopPath}`;

    // Parse provided cookie string into the jar
    if (cookieString) {
      cookieString.split(';').forEach(c => {
        if (c.trim()) {
          try {
            jar.setCookieSync(c.trim(), baseUrl);
          } catch (e) {
            console.warn('[GameCheck] Cookie parse error:', e.message);
          }
        }
      });
    }

    const shopResponse = await client.get(shopUrl, {
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    const $ = cheerio.load(shopResponse.data);
    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    if (!csrfToken) {
      console.error('[GameCheck] CSRF Token not found in HTML');
      return res.status(500).json({
        success: false,
        message: 'Failed to extract security token from provider',
      });
    }

    // 4. Perform the Name Check based on Game Type
    let checkUrl = `${baseUrl}/name-check`;
    let payload = {
      game_id: String(game_id),
      server_id: server_id ? String(server_id) : '1',
      game: game,
    };

    if (game === 'mcgg') {
      checkUrl = `${baseUrl}/check-user-mcgg`;
      payload = {
        game_id: String(game_id),
        server_id: String(server_id),
        _token: csrfToken,
      };
    } else if (game === 'wwm') {
      checkUrl = `${baseUrl}/check-username`;
      payload = {
        game_id: String(game_id),
        server_id: server_id ? String(server_id) : '',
        game: 'wwm',
        char_name: '',
      };
    }

    const checkResponse = await client.post(checkUrl, payload, {
      timeout,
      headers: {
        'X-CSRF-TOKEN': csrfToken,
        'Content-Type': 'application/json',
        'Referer': shopUrl,
        'Origin': baseUrl,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    const rawData = checkResponse.data;
    let data = rawData;

    // Handle MCGG nested response
    if (game === 'mcgg' && typeof rawData.response === 'string') {
      try {
        data = JSON.parse(rawData.response);
      } catch (e) {
        console.error('[GameCheck] MCGG JSON parse error');
      }
    }

    // Extract Nickname
    const nicknameResult = data.username || data.name || data.nickname;

    // Standard Success Check
    if (data && (data.code === 200 || data.status === true || data.success === true)) {
      // Special check for WWM - it must have a nickname and not be empty
      if (game === 'wwm' && !nicknameResult) {
        console.log(`[GameCheck] WWM returned success but NO NICKNAME:`, JSON.stringify(data, null, 2));
        return res.status(400).json({
          success: false,
          message: 'Invalid User ID for Westward: M',
          raw: data,
        });
      }

      console.log(`[GameCheck] Success Response for ${game}:`, JSON.stringify(data, null, 2));
      return res.status(200).json({
        success: true,
        nickname: nicknameResult || 'Unknown',
        region: data.region || data.server || 'Unknown',
        raw: data,
      });
    }

    console.log(`[GameCheck] Failure Response for ${game}:`, JSON.stringify(data, null, 2));

    return res.status(400).json({
      success: false,
      message: data.info || data.message || 'Invalid User ID or Server ID',
      raw: data,
    });

  } catch (err) {
    console.error('[GameCheck] Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to game provider',
      error: err.message,
    });
  }
};

// @desc    Perform real buy from game shop
// @access  Internal
exports.buyProduct = async (order) => {
  try {
    const { game, product_id, player_id, server_id } = order;

    // 1. Get Settings
    const baseUrlSetting = await Setting.findOne({ key: 'so_miniapp_base_uri' });
    const cookieSetting = await Setting.findOne({ key: 'so_miniapp_cookie' });
    const timeoutSetting = await Setting.findOne({ key: 'so_miniapp_timeout' });

    let baseUrl = (baseUrlSetting && baseUrlSetting.value) ? baseUrlSetting.value : 'https://so.miniapp.zone';
    const cookieString = cookieSetting ? cookieSetting.value : '';
    const timeout = (timeoutSetting && timeoutSetting.value) ? parseInt(timeoutSetting.value) * 1000 : 30000;

    baseUrl = baseUrl.replace(/\/+$/, '');

    // 2. Setup Axios with Cookie Jar
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    // 3. Pre-fetch shop page to get CSRF token
    // Mapping gameId to shop path based on old project patterns
    let shopPath = `/shop/${game}`;
    if (game === 'mlbb') shopPath = '/shop/mlbb';
    else if (game === 'pubg') shopPath = '/shop/pubg';
    else if (game === 'mcgg') shopPath = '/shop/mcgg';
    else if (game === 'wwm') shopPath = '/shop/wwm';
    
    const shopUrl = `${baseUrl}${shopPath}`;

    if (cookieString) {
      cookieString.split(';').forEach(c => {
        if (c.trim()) {
          try {
            jar.setCookieSync(c.trim(), baseUrl);
          } catch (e) {
            console.warn('[GameBuy] Cookie parse error:', e.message);
          }
        }
      });
    }

    const shopResponse = await client.get(shopUrl, {
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    const $ = cheerio.load(shopResponse.data);
    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    if (!csrfToken) {
      throw new Error('CSRF Token not found in shop page');
    }

    // 4. Perform the Buy request
    // According to old Laravel project (SoGameService.php):
    // - Endpoint: /order
    // - Method: POST
    // - Content-Type: application/x-www-form-urlencoded
    // - Critical Field: pmethod = 'usecoin'
    const buyUrl = `${baseUrl}/order`;
    const payload = new URLSearchParams({
      _token: csrfToken,
      pmethod: 'usecoin', // Verified from old project
      game_id: String(player_id),
      server_id: server_id ? String(server_id) : '1',
      product_id: String(product_id),
      count: '1',
    });

    console.log(`[GameBuy] Initiating buy for Order ${order._id} at ${buyUrl}`);

    const buyResponse = await client.post(buyUrl, payload.toString(), {
      timeout,
      maxRedirects: 0, // Old project expects 302
      validateStatus: (status) => (status >= 200 && status < 400), // Accept 3xx redirects
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': csrfToken,
        'Referer': shopUrl,
        'Origin': baseUrl,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    console.log(`[GameBuy] Response for Order ${order._id}: Status ${buyResponse.status}`);

    // Status 200, 201 or 302 are considered success in the old project
    const isSuccess = [200, 201, 302].includes(buyResponse.status);

    return {
      success: isSuccess,
      message: isSuccess ? 'Purchase successful' : 'Purchase failed at provider',
      api_response: buyResponse.data
    };
  } catch (err) {
    console.error(`[GameBuy] Error for Order ${order._id}:`, err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Real buy request failed'
    };
  }
};
