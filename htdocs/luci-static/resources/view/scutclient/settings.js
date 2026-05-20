'use strict';
'require form';
'require request';
'require view';

return view.extend({
load: function() {
return request.get(L.url('admin/services/scutclient/hostnames'), { query: {} })
.then(function(res) {
if (!res || !res.ok)
return {};
return res.json();
})
.catch(function() { return {}; });
},

	render: function(hostnames) {
		var m, s, o;
		var generatedHostname = hostnames && hostnames.random ? hostnames.random : 'DESKTOP-0000000';
		var dhcpHostname = hostnames && hostnames.dhcp ? hostnames.dhcp : null;
		var setupLinks;

		m = new form.Map('scutclient', '华南理工大学客户端 设置',
			'步骤 1：请先设置 Wi-Fi；步骤 2：请设置网络 IP；步骤 3：建议修改路由器管理密码。');

s = m.section(form.TypedSection, 'option', '选项');
s.anonymous = true;
o = s.option(form.Flag, 'enable', '启用');
o.rmempty = false;

s = m.section(form.TypedSection, 'scutclient', '用户信息');
s.anonymous = true;
s.option(form.Value, 'username', '拨号用户名', '学校提供的用户名，一般是学号');
o = s.option(form.Value, 'password', '拨号密码');
o.password = true;

s = m.section(form.TypedSection, 'drcom', 'Drcom设置');
s.anonymous = true;

o = s.option(form.ListValue, 'version', 'Drcom版本');
o.rmempty = false;
o.value('4472434f4d0096022a');
o.value('4472434f4d0096022a00636b2031');
o.value('4472434f4d00cf072a00332e31332e302d32342d67656e65726963');
o.default = '4472434f4d0096022a';

o = s.option(form.ListValue, 'hash', 'DrAuthSvr.dll版本');
o.rmempty = false;
o.value('2ec15ad258aee9604b18f2f8114da38db16efd00');
o.value('d985f3d51656a15837e00fab41d3013ecfb6313f');
o.value('915e3d0281c3a0bdec36d7f9c15e7a16b59c12b8');
o.default = '2ec15ad258aee9604b18f2f8114da38db16efd00';

o = s.option(form.Value, 'server_auth_ip', '服务器IP');
o.rmempty = false;
o.datatype = 'ip4addr';
o.value('202.38.210.131');

o = s.option(form.Value, 'nettime', '允许上网时间');
o.description = '允许的上网时间，断网后等待到指定时间重新开始认证。如6:15';
o.validate = function(section_id, value) {
if (!value || value.indexOf(':') < 0)
return '上网时间格式错误！';

var sp = value.split(':');
if (sp.length !== 2)
return '上网时间格式错误！';

var hour = +sp[0], minute = +sp[1];
if (hour >= 0 && hour < 12 && minute >= 0 && minute < 60)
return true;

return '上网时间格式错误！';
};

		o = s.option(form.Value, 'hostname', '向服务器发送的主机名');
		o.rmempty = false;
		o.value(generatedHostname);
		if (dhcpHostname)
			o.value(dhcpHostname);
		o.default = generatedHostname;

		setupLinks = E('div', { 'style': 'margin-bottom: 10px;' }, [
			E('a', { 'class': 'btn cbi-button cbi-button-action', 'style': 'margin: 2px;', 'href': L.url('admin/network/wireless/radio0.network1') }, 'Step 1 : 点此处去设置Wi-Fi'),
			E('a', { 'class': 'btn cbi-button cbi-button-action', 'style': 'margin: 2px;', 'href': L.url('admin/network/network') }, 'Step 2 : 点此处去设置IP'),
			E('a', { 'class': 'btn cbi-button cbi-button-action', 'style': 'margin: 2px;', 'href': L.url('admin/system/admin') }, 'Step 3 : 点此处去修改路由器管理密码')
		]);

		return m.render().then(function(node) {
			return E('div', [ setupLinks, node ]);
		});
	}
});
