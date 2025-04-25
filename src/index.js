import {getNetworkServices, disableHttpProxy, getProxySettings, setHttpProxy, setHttpsProxy, disableHttpsProxy} from './utils/system.js'


// 主函数示例
async function main() {
    // 查询当前代理设置
    console.log('Fetching current proxy settings...');
    await getProxySettings();

    // // 假设使用第一个网络服务（例如 Wi-Fi）
    // const networkService = 'Wi-Fi';
    //
    // // 设置 HTTP 代理
    // console.log(`Setting HTTP proxy for ${networkService}...`);
    // await setHttpProxy(networkService, 'proxy.example.com', 8080);
    //
    // // 设置 HTTPS 代理
    // console.log(`Setting HTTPS proxy for ${networkService}...`);
    // await setHttpsProxy(networkService, 'proxy.example.com', 8080);
    //
    // // 再次查询代理设置以确认
    // console.log('Fetching updated proxy settings...');
    // await getProxySettings();
    //
    // // 示例：禁用 HTTP 代理
    // console.log(`Disabling HTTP proxy for ${networkService}...`);
    // await disableHttpProxy(networkService);
    await disableHttpsProxy('Wi-Fi')
}

// 运行主函数
main().catch(err => console.error('Main function error:', err));
