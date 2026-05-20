'use strict';
'require view';
'require poll';
'require request';

return view.extend({
handleSave: null,
handleSaveApply: null,
handleReset: null,

render: function() {
var textarea = E('textarea', {
'style': 'font-size: 12px; width: 100%;',
'readonly': 'readonly',
'wrap': 'off',
'rows': '50'
}, [ 'Collecting data...' ]);

poll.add(function() {
return request.get(L.url('admin/services/scutclient/get_log'), { query: {} }).then(function(res) {
if (res && res.ok)
return res.text();
return '_nodata_';
}).then(function(text) {
if (text !== '_nodata_') {
textarea.value = text;
textarea.scrollTop = textarea.scrollHeight;
}
});
}, 3);

return E('div', { 'class': 'cbi-map' }, [
E('h2', '客户端日志'),
E('table', { 'width': '100%', 'cellspacing': '10', 'class': 'table cbi-section-table' }, [
E('tbody', [
E('tr', { 'class': 'tr cbi-section-table-row' }, [
E('td', { 'width': '33%' }, E('strong', '配置文件')),
E('td', E('a', {
'class': 'btn cbi-button cbi-button-action',
'href': L.url('admin/services/scutclient/scutclient-log.tar'),
'target': '_blank'
}, '打包下载'))
])
])
]),
E('h3', 'scutclient日志'),
E('div', { 'id': 'content_logs' }, [ textarea ])
]);
}
});
