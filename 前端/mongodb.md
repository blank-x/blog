### 腾讯云 配置

配置文件地址：/etc/mongod.conf

logAppend: true

log 地址path: /var/log/mongodb/mongod.log

dbPath: /var/lib/mongo

**命令**

systemctl start mongod， 启动mongodb，

systemctl status mongod  查看状态

systemctl restart mongod 重启

**地址配置**

0.0.0.0 可以外网访问

net:

  port: 27017

  bindIp: 0.0.0.0  # Enter 0.0.0.0,:: to bind to all IPv4 and IPv6 addresses or, alternatively, use the net.bindIpAll setting.

还需要在腾讯云控制台设置端口号27017；



