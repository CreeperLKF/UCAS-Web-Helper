# UCAS-Web-Helper
国科大网页小助手，支持课程下载、辅助评教、辅助访问文献资源等功能

**此脚本仅用于学习交流。禁止滥用此脚本，例如批量下载视频、未经授权上传视频到其它平台等行为。**

## 功能说明

### 课程下载

支持提取国科大智慧课堂视频的下载链接。

### 辅助评教

评教网站目前有提交跨域问题，还有神奇的15字限制。
脚本会检测选项是否已选，文字是否已填（以及是否符合长度要求），如果没有的话就默认选非常满意且填“无”，然后提交。

**需要手动填写验证码（但不用点保存）**，填完之后点击右上角按钮即可。

### 辅助访问文献资源

可以将任意网站转换成libvpn的链接，从而可以本地先搜索好资源，再到libvpn中下载。
一般的使用场景是：zotero可能不能正确处理经由libvpn访问的页面，需要在原始文献网页中处理引用；
此外，libvpn在高峰期会缓慢甚至不可用，这种使用方法可以减少等待时间提高文献检索效率。

## 使用方法

下载UCAS_WebHelper.user.js文件，安装篡改猴（TampeMonkey），然后添加该脚本（可以在管理面板把脚本拖进去或者手动复制粘贴）。

在评教页面以及智慧课堂的录播页面、观看视频页面、从sep进去的文献下载页面能看到按钮，点击即可使用功能，所见即所得。

可以参考[我的博客](https://www.elpsylkf.work/p/ucas-web-helper/)，会更新一些图片说明。
