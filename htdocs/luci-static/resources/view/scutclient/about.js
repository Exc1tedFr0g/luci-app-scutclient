'use strict';
'require view';

return view.extend({
handleSave: null,
handleSaveApply: null,
handleReset: null,

render: function() {
return E('div', { 'class': 'cbi-map' }, [
E('h2', E('a', { 'id': 'about', 'name': 'about' }, '许可证')),
E('p', { 'style': 'text-align:center;' }, [
E('a', { 'href': 'https://www.gnu.org/licenses/agpl-3.0.html', 'target': '_blank', 'rel': 'noreferrer noopener' }, 'AGPLv3')
]),
E('p', { 'style': 'text-align:center;' }, '特别指出禁止任何个人或组织将scutclient的代码投入商业使用，由此造成的后果和法律责任后果自负。'),
E('h2', E('a', { 'id': 'thanks', 'name': 'thanks' }, '致谢')),
E('p', { 'style': 'text-align:center;' }, [ '群主的猫', E('br'), 'ฅ(⌯͒• ɪ •⌯͒)ฅ❣' ]),
E('br'),
E('p', { 'style': 'text-align:center;' }, [
E('a', { 'href': 'http://weibo.com/scutrouter', 'target': '_blank', 'rel': 'noreferrer noopener' }, '华工路由器群官方微博'),
E('br'),
'QQ审核群：',
E('a', { 'href': 'http://jq.qq.com/?_wv=1027&k=27KCAyx', 'target': '_blank', 'rel': 'noreferrer noopener' }, '262939451')
])
]);
}
});
