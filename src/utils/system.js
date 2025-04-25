import util from 'node:util'
import {exec} from 'node:child_process'

const execPromise = util.promisify(exec);


// 查询当前系统代理设置
export async function getProxySettings() {
    try {
        const {stdout, stderr} = await execPromise('scutil --proxy');
        if (stderr) {
            console.error('Error querying proxy settings:', stderr);
            return null;
        }
        console.log('Current Proxy Settings:', stdout);
        return stdout;
    } catch (error) {
        console.error('Failed to query proxy settings:', error.message);
        return null;
    }
}

// 设置 HTTP 代理
export async function setHttpProxy(networkService, proxyServer, proxyPort) {
    try {
        const command = `networksetup -setwebproxy "${networkService}" ${proxyServer} ${proxyPort}`;
        const {stdout, stderr} = await execPromise(command);
        if (stderr) {
            console.error('Error setting HTTP proxy:', stderr);
            return false;
        }
        console.log('HTTP Proxy Set Successfully:', stdout);
        return true;
    } catch (error) {
        console.error('Failed to set HTTP proxy:', error.message);
        return false;
    }
}

// 设置 HTTPS 代理
export async function setHttpsProxy(networkService, proxyServer, proxyPort) {
    try {
        const command = `networksetup -setsecurewebproxy "${networkService}" ${proxyServer} ${proxyPort}`;
        const {stdout, stderr} = await execPromise(command);
        if (stderr) {
            console.error('Error setting HTTPS proxy:', stderr);
            return false;
        }
        console.log('HTTPS Proxy Set Successfully:', stdout);
        return true;
    } catch (error) {
        console.error('Failed to set HTTPS proxy:', error.message);
        return false;
    }
}

// 禁用 HTTP 代理
export async function disableHttpProxy(networkService) {
    try {
        const command = `networksetup -setwebproxystate "${networkService}" off`;
        const {stdout, stderr} = await execPromise(command);
        if (stderr) {
            console.error('Error disabling HTTP proxy:', stderr);
            return false;
        }
        console.log('HTTP Proxy Disabled:', stdout);
        return true;
    } catch (error) {
        console.error('Failed to disable HTTP proxy:', error.message);
        return false;
    }
}

export async function disableHttpsProxy(networkService) {
    try {
        const command = `networksetup -setsecurewebproxystate "${networkService}" off`;
        const {stdout, stderr} = await execPromise(command);
        if (stderr) {
            console.error('Error disabling HTTP proxy:', stderr);
            return false;
        }
        console.log('HTTP Proxy Disabled:', stdout);
        return true;
    } catch (error) {
        console.error('Failed to disable HTTP proxy:', error.message);
        return false;
    }
}

// 获取网络服务列表
export async function getNetworkServices() {
    try {
        const {stdout, stderr} = await execPromise('networksetup -listallnetworkservices');
        if (stderr) {
            console.error('Error listing network services:', stderr);
            return null;
        }
        const services = stdout.split('\n').filter(line => line && !line.includes('An asterisk (*)'));
        console.log('Network Services:', services);
        return services;
    } catch (error) {
        console.error('Failed to list network services:', error.message);
        return null;
    }
}
