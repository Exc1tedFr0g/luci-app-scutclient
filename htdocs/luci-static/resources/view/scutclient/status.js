'use strict';
'require view';
'require request';
'require ui';

function sameSubnetPrefix3(ip, gateway) {
if (!ip || !gateway)
return true;

var ipa = ip.match(/\d+/g);
var gwa = gateway.match(/\d+/g);
if (!ipa || !gwa || ipa.length < 3 || gwa.length < 3)
return true;

return (ipa[0] === gwa[0] && ipa[1] === gwa[1] && ipa[2] === gwa[2]);
}

return view.extend({
handleSave: null,
handleSaveApply: null,
handleReset: null,

load: function() {
return request.get(L.url('admin/services/scutclient/status_data'), { query: {} })
.then(function(res) {
if (!res || !res.ok)
return {};
return res.json();
})
.catch(function() { return {}; });
},

render: function(data) {
var conf = {
enable: data.enable || '',
username: data.username || '',
password: data.password || '',
hostname: data.hostname || '',
version: data.version || '',
hash: data.hash || '',
server_auth_ip: data.server_auth_ip || ''
};
var wan = data.wan || null;
var ipaddr = wan ? (wan.ipaddr || '') : '';
var gateway = wan ? (wan.gateway || '') : '';
var sameSubnet = sameSubnetPrefix3(ipaddr, gateway);
var userText = (conf.username === 'root') ? (conf.username + '。。。你的浏览器开启了自动保存帐号密码？') : conf.username;

function control(action) {
return request.get(L.url('admin/services/scutclient/control'), {
query: { act: action }
}).then(function() {
ui.addNotification(null, E('p', action + ' 操作已发送'));
});
}

		var netStateCell = E('td', { 'style': 'color: #666;' }, '获取中……');

		request.get(L.url('admin/services/scutclient/netstat'), { query: {} })
			.then(function(res) {
				if (!res || !res.ok)
					return null;
				return res.json();
			})
			.then(function(info) {
				if (!info || !info.stat) {
					netStateCell.style.color = 'red';
					netStateCell.textContent = '网络状态获取错误！';
					return;
				}

				if (info.stat === 'internet') {
					netStateCell.style.color = 'green';
					netStateCell.textContent = '网络正常';
				} else if (info.stat === 'no_login') {
					netStateCell.style.color = '#FFA500';
					netStateCell.textContent = '校园网未登录';
				} else {
					netStateCell.style.color = 'red';
					netStateCell.textContent = '网络错误！检查网线/IP设置！';
				}
			})
			.catch(function() {
				netStateCell.style.color = 'red';
				netStateCell.textContent = '网络状态获取错误！';
			});

if (!sameSubnet && wan)
ui.addNotification(null, E('p', ipaddr + '\n' + gateway + '\n前三位不一致，请看教程三遍！'), 'warning');

return E('div', { 'class': 'cbi-map' }, [
E('h2', '客户端状态'),
E('fieldset', { 'class': 'cbi-section' }, [
E('legend', E('strong', '状态')),
E('table', { 'class': 'table cbi-section-table', 'width': '100%', 'cellspacing': '10' }, [
E('tbody', [
E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', 'scutclient')), E('td', { 'style': 'color: red;' }, data.running ? '正在运行' : '没有运行') ]),
data.wifi_up ? E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', 'Wi-Fi SSID ：')), E('td', data.wifi_ssid || '-') ]) : E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'style': 'color: red;' }, E('strong', 'Wi-Fi 状态:')), E('td', { 'style': 'color: red;' }, E('strong', '未开启，或路由器没有无线网卡')) ]),
wan ? E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, 'WAN口'), E('td', wan.name || '-') ]) : E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'style': 'color: red;' }, E('strong', 'WAN口未正确配置')) ]),
wan ? E('tr', { 'class': 'tr cbi-section-table-row', 'style': sameSubnet ? '' : 'color: red;' }, [ E('td', { 'width': '33%' }, E('strong', 'IP地址')), E('td', wan.ipaddr || '-') ]) : null,
wan ? E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', '子网掩码')), E('td', wan.netmask || '-') ]) : null,
wan ? E('tr', { 'class': 'tr cbi-section-table-row', 'style': sameSubnet ? '' : 'color: red;' }, [ E('td', { 'width': '33%' }, E('strong', '网关')), E('td', wan.gateway || '-') ]) : null,
wan ? E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', 'DNS')), E('td', wan.dns || '-') ]) : null,
wan ? E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', 'MAC')), E('td', wan.mac || '-') ]) : null,
					wan ? E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', '网络状态')), netStateCell ]) : null
].filter(function(r) { return !!r; }))
])
]),
E('fieldset', { 'class': 'cbi-section' }, [
E('legend', E('strong', '客户端设置')),
E('table', { 'class': 'table cbi-section-table', 'width': '100%', 'cellspacing': '10' }, [
E('tbody', [
E('tr', { 'class': 'tr cbi-section-table-row' }, [
E('td', { 'width': '33%' }, E('strong', '功能')),
E('td', [
E('button', { 'class': 'btn cbi-button cbi-button-action', 'click': ui.createHandlerFn(this, function() { return control('logoff'); }) }, [ '下线' ]),
' ',
E('button', { 'class': 'btn cbi-button cbi-button-action', 'click': ui.createHandlerFn(this, function() { return control('redial'); }) }, [ '重拨' ])
])
]),
data.scutclient_version ? E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', '已安装版本：')), E('td', data.scutclient_version) ]) : E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'style': 'color: red;' }, E('strong', 'scutclient未安装')) ]),
E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', '开机启动')), E('td', conf.enable) ]),
E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', '账号')), E('td', conf.username === 'root' ? E('span', { 'style': 'color: red;' }, userText) : userText) ]),
E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', '密码')), E('td', conf.password) ]),
E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', '主机名')), E('td', conf.hostname) ]),
E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', 'Drcom版本')), E('td', conf.version) ]),
E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', 'Hash')), E('td', conf.hash) ]),
E('tr', { 'class': 'tr cbi-section-table-row' }, [ E('td', { 'width': '33%' }, E('strong', '服务器IP')), E('td', conf.server_auth_ip) ])
])
])
])
]);
}
});
