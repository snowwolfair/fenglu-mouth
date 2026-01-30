# koishi-plugin-fenglu-mouth

[![npm](https://img.shields.io/npm/v/koishi-plugin-fenglu-mouth?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-fenglu-mouth)

一个适用于 QQ onebot 机器人的根据当前银价自动转换工资为俸禄的查询插件

# 起源

灵感来源于该梗图

<img src="/src/asset/chart.jpg" alt="chart" />

# 食用方法

- 在群内发送命令 <b style="color: #08b402ff;">elu</b> 或 <b style="color: #08b402ff;">查询俸禄</b> , 然后根据提示输入工资即可查询俸禄
- 在配置页面需要自行配置 `key`
  - `暂时仅支持的` key 获取地址: [www.goldapi.io](https://www.goldapi.io/)
- 更换配置获取在不同朝代的俸禄

# 注意事项

- 目前仅测试了 QQ onebot 机器人可用
- 请自行添加贵金属价格获取API
- 目前暂时只支持 `www.goldapi.io` 的 key
