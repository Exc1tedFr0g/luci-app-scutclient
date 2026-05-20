module("luci.controller.scutclient", package.seeall)

local http = require "luci.http"
local fs = require "nixio.fs"
local sys  = require "luci.sys"
local uci  = require "luci.model.uci".cursor()

local log_file = "/tmp/scutclient.log"
local log_file_backup = "/tmp/scutclient.log.backup.log"

local function trim(s)
if not s then
return ""
end
return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function get_net_state()
local hcontent = trim(sys.exec("wget -O- http://whatismyip.akamai.com 2>/dev/null | head -n1"))

if hcontent == '' then
return 'no_internet'
elseif hcontent:find("(%d+)%.(%d+)%.(%d+)%.(%d+)") then
return 'internet'
else
return 'no_login'
end
end

function index()
if not fs.access("/etc/config/scutclient") then
return
end

local mainorder = uci:get_first("scutclient", "luci", "mainorder", 10)

entry({"admin", "services", "scutclient"},
alias("admin", "services", "scutclient", "settings"),
"华南理工大学客户端",
mainorder
)

entry({"admin", "services", "scutclient", "settings"}, view("scutclient/settings"), "设置", 10).leaf = true
entry({"admin", "services", "scutclient", "status"}, view("scutclient/status"), "状态", 20).leaf = true
entry({"admin", "services", "scutclient", "logs"}, view("scutclient/logs"), "日志", 30).leaf = true
entry({"admin", "services", "scutclient", "about"}, view("scutclient/about"), "关于", 40).leaf = true

entry({"admin", "services", "scutclient", "control"}, call("action_control")).leaf = true
entry({"admin", "services", "scutclient", "status_data"}, call("get_status_data")).leaf = true
entry({"admin", "services", "scutclient", "hostnames"}, call("get_hostname_candidates")).leaf = true
entry({"admin", "services", "scutclient", "get_log"}, call("get_log")).leaf = true
entry({"admin", "services", "scutclient", "netstat"}, call("get_netstat")).leaf = true
entry({"admin", "services", "scutclient", "scutclient-log.tar"}, call("get_dbgtar")).leaf = true
end

function action_control()
local act = http.formvalue("act")
local ok = true

if act == "logoff" then
sys.call("/etc/init.d/scutclient stop > /dev/null")
elseif act == "redial" then
sys.call("/etc/init.d/scutclient stop > /dev/null")
sys.call("/etc/init.d/scutclient start > /dev/null")
elseif act == "move_tag" then
sys.call("uci set scutclient.@luci[-1].mainorder=90")
sys.call("uci commit")
sys.call("rm -rf /tmp/luci-*cache")
else
ok = false
end

http.prepare_content("application/json")
http.write_json({ ok = ok })
http.close()
end

function get_status_data()
local ntm = require "luci.model.network".init()
local stat, wan_nets = pcall(ntm.get_wan_networks, ntm)
local wan, wandev
local data = {
running = (sys.call("pidof scutclient > /dev/null 2>/dev/null") == 0),
wifi_up = (string.sub(sys.exec("wifi status|grep up|head -n 1|awk {'print $2'}"), 1, 4) == "true"),
wifi_ssid = trim(sys.exec("uci get wireless.@wifi-iface[0].ssid 2>/dev/null")),
scutclient_version = trim(sys.exec("opkg list-installed scutclient | cut -d ' ' -f 3")),
enable = uci:get_first("scutclient", "option", "enable") or "",
username = uci:get_first("scutclient", "scutclient", "username") or "",
password = uci:get_first("scutclient", "scutclient", "password") or "",
hostname = uci:get_first("scutclient", "drcom", "hostname") or "",
version = uci:get_first("scutclient", "drcom", "version") or "",
hash = uci:get_first("scutclient", "drcom", "hash") or "",
server_auth_ip = uci:get_first("scutclient", "drcom", "server_auth_ip") or "",
net_state = get_net_state()
}

if stat and #wan_nets > 0 then
wan = wan_nets[1]
wandev = wan:get_interface()
elseif not stat then
wan = ntm:get_wannet()
wandev = ntm:get_wandev()
end

if wan then
data.wan = {
name = wandev and wandev:name() or "",
ipaddr = wan:ipaddr() or "",
netmask = wan:netmask() or "",
gateway = wan:gwaddr() or "",
dns = table.concat(wan:dnsaddrs() or {}, ","),
mac = wandev and wandev:mac() or ""
}
end

http.prepare_content("application/json")
http.write_json(data)
http.close()
end

function get_hostname_candidates()
local random_hostname = "DESKTOP-"
local dhcp_host = trim(sys.exec("cat /tmp/dhcp.leases 2>/dev/null | awk '{print $4}' | head -n1"))
local chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

math.randomseed(os.time())
for i = 1, 7 do
local idx = math.random(1, #chars)
random_hostname = random_hostname .. chars:sub(idx, idx)
end

http.prepare_content("application/json")
http.write_json({
random = random_hostname,
dhcp = (dhcp_host ~= "" and dhcp_host ~= "*") and dhcp_host or nil
})
http.close()
end

function get_log()
local send_log_lines = 75
local client_log

if fs.access(log_file) then
client_log = sys.exec("tail -n " .. send_log_lines .. " " .. log_file)
else
client_log = "Unable to access the log file!"
end

http.prepare_content("text/plain; charset=gbk")
http.write(client_log)
http.close()
end

function get_netstat()
http.prepare_content("application/json")
http.write_json({ stat = get_net_state() })
http.close()
end

function get_dbgtar()
local tar_dir = "/tmp/scutclient-log"
local tar_files = {
"/etc/config/wireless",
"/etc/config/network",
"/etc/config/system",
"/etc/config/scutclient",
"/etc/openwrt_release",
"/etc/crontabs/root",
"/etc/config/dhcp",
"/tmp/dhcp.leases",
"/etc/rc.local"
}

	fs.mkdirr(tar_dir)
	for _, v in ipairs(tar_files) do
		sys.call(string.format("cp %q %q", v, tar_dir))
	end

	if fs.access(log_file_backup) then
		sys.call(string.format("cat %q >> %q", log_file_backup, tar_dir .. "/scutclient.log"))
	end
	if fs.access(log_file) then
		sys.call(string.format("cat %q >> %q", log_file, tar_dir .. "/scutclient.log"))
	end

	http.prepare_content("application/octet-stream")
	http.write(sys.exec(string.format("tar -C %q -cf - .", tar_dir)))
	sys.call(string.format("rm -rf %q", tar_dir))
	http.close()
end
