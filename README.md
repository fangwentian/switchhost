# 可能是你见过最好用的switch host工具

## 痛点
市面上的switch host 工具设置完虽然改变了系统的hosts, 但是因为chrome 有自己的dns cache的原因，这个缓存要在几分钟后才更新。要么等，要么新开隐身窗口（但是cookie会丢失），很影响工作节奏。于是用electron开发了这个带flush socket pools的switch host工具。


## 使用指南
**工具目前只支持mac系统，浏览器必须是chrome**

只需三步：

### 第一步：设置host文件修改权限
sudo chmod 777 /etc/hosts

### 第二步：设置chrome权限
Chrome，视图 -> 开发者 -> 允许Apple事件中的JavaScript

![image.png](https://img.alicdn.com/tfs/TB1sWKMT4D1gK0jSZFsXXbldVXa-497-344.png)


### 第三步：安装工具
↓↓↓安装包见最下面的版本信息↓↓↓

#### 添加host

![330.jpg](https://img.alicdn.com/tfs/TB1vxaPT1H2gK0jSZJnXXaT1FXa-2048-1456.jpg)

#### 保存、开/关 host（和其他swith host 使用方式基本一致）
保存、开/关 host的时候会写本地host文件，确认是否成功:


```javascript
cat /etc/hosts
```

Tips: 保存了才会持久化，不然再切过来就没了

保存完，应用会自动去执行chorme的flush socket pools，第一次会有一个权限允许的提示，选同意。

![333.jpg](https://img.alicdn.com/tfs/TB1a61PT1H2gK0jSZJnXXaT1FXa-1581-465.jpg)


### 注意事项

- 使用时关闭其他的swith host工具，不然会有争抢权限的问题。如果出现这种情况导致的问题，关闭其他工具，重新 sudo chmod 777 /etc/hosts 即可


### 版本信息
#### 1.3.0
[Switch Host-Egg-1.3.0.dmg](https://github.com/fangwentian/switchhost/releases/tag/1.3.0)
##### changelog:

- 增加搜索功能 - command + F
- 修改关闭的host不刷新chrome
- 刷新chrome增加debounce为1.5秒，避免过多刷新



