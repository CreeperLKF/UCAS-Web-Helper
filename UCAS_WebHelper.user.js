// ==UserScript==
// @name         UCAS Web Helper
// @namespace    https://www.elpsylkf.work/
// @version      0.8
// @description  Helper tools for UCAS web systems including fetching course video URL and course evaluation
// @author       LinearKF
// @match        https://ucas.smartclass.cn/UserSpace/CourseList.aspx
// @match        https://ucas.smartclass.cn/PlayPages/*
// @match        https://jwxk.ucas.ac.cn/evaluate/*
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
        .floating-button {
            position: fixed;
            width: 48px;
            height: 48px;
            border-radius: 50% !important;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            user-select: none;
            -webkit-user-drag: none;
            top: 20px;
            right: -20px;
            transition: right 0.3s ease;
        }
        .floating-button:hover {
            right: -3px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        .results-container {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            overflow-y: auto;
        }
        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .results-header h3 {
            margin: 0;
        }
        .close-button {
            padding: 5px 10px;
            cursor: pointer;
            border: none;
            background: #f0f0f0;
            border-radius: 4px;
        }
        .video-item {
            margin-bottom: 15px;
            padding: 10px;
            border: 1px solid #eee;
            border-radius: 4px;
        }
        .video-item:hover {
            background: #f9f9f9;
        }
        .course-info {
            margin-bottom: 8px;
            font-weight: bold;
        }
        .video-url {
            word-break: break-all;
            color: #0066cc;
            margin-bottom: 5px;
        }
        .copy-button {
            padding: 3px 8px;
            margin-top: 5px;
            cursor: pointer;
            border: 1px solid #ccc;
            background: #f5f5f5;
            border-radius: 3px;
            font-size: 12px;
        }
        .copy-button:hover {
            background: #e5e5e5;
        }
    `;
    document.head.appendChild(styles);

    function createButton(onClick) {
        const button = document.createElement('img');
        button.src = 'https://www.elpsylkf.work/favicon.ico';
        button.className = 'floating-button';
        button.addEventListener('click', onClick);
        document.body.appendChild(button);
        return button;
    }

    // Create results container (initially hidden)
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-container';
    resultsContainer.style.display = 'none';
    document.body.appendChild(resultsContainer);

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('已复制到剪贴板！');
        }).catch(err => {
            console.error('复制失败:', err);
        });
    }

    // Function to handle CourseList page
    function handleCourseList() {
        const elements = document.querySelectorAll('.zIndex.fl');
        const results = [];

        elements.forEach(element => {
            const imgElement = element.querySelector('.videoCourseCover');
            const titleElement = element.querySelector('h4');

            if (!imgElement || !titleElement) return;

            const originalUrl = imgElement.src;
            if (!originalUrl) return;

            const urlMatch = originalUrl.match(/dx82-4\/(\d{4}\/\d{2}\/\d{2}\/\d+)/);
            if (!urlMatch) return;

            const pathPart = urlMatch[1];
            const videoUrl = `https://minvo.ucas.ac.cn:9300/bucket-vplus/dx82-4/${pathPart}/0/Video1.mp4`;

            results.push({
                courseInfo: titleElement.title,
                videoUrl: videoUrl
            });
        });

        return results;
    }

    // Function to handle PlayPages
    function handlePlayPages() {
        const results = [];
        const urlParams = new URLSearchParams(window.location.search);
        const NewId = urlParams.get('NewID');

        if (!NewId) return results;

        var n = "/Video/GetVideoInfoDtoByID"
        , t = {
            NewId: NewId,
            isGetLink: true,
            VideoPwd: localStorage.getItem("hasVideoPassword_" + NewId),
            hber: Math.random(),
            isloadstudent: true
        };

        if (GetQueryString("IsNotNeedLogin")) {
            n = AjaxUrls.OperateVideo.GetVideoByID;
            t = {
                NewId: NewId,
                isGetLink: true
            };
        }

        Ajax.ajax({
            url: n,
            type: "get",
            data: t,
            async: false
        }).done(function(n) {
            var data = n;
            if (data.VideoSegmentInfo && Array.isArray(data.VideoSegmentInfo)) {
                data.VideoSegmentInfo.forEach((segment, index) => {
                    if (segment.PlayFileUri) {
                        const videoUrl = segment.PlayFileUri
                            .replace('https://ucasvs4.smartclass.cn:8010', 'https://minvo.ucas.ac.cn:9300/bucket-vplus')
                            .replace('content.html', 'Video1.mp4');

                        results.push({
                            courseInfo: `视频片段 ${index + 1}`,
                            videoUrl: videoUrl
                        });
                    }
                });
            }
        }).fail(function(n) {
            if (n === "密码错误") {
                enterPsd();
            } else {
                Dialogue.Error(n);
            }
        });

        return results;
    }

    function displayResults(results) {
        resultsContainer.innerHTML = `
            <div class="results-header">
                <h3>转换结果 (共${results.length}个)</h3>
                <button class="close-button">关闭</button>
            </div>
            ${results.map((item, index) => `
                <div class="video-item">
                    <div class="course-info">${index + 1}. ${item.courseInfo}</div>
                    <div class="video-url">${item.videoUrl}</div>
                    <button class="copy-button" data-url="${item.videoUrl}">复制链接</button>
                </div>
            `).join('')}
        `;

        resultsContainer.style.display = 'block';
        floatingButton.style.display = 'none';

        // Add event listeners
        resultsContainer.querySelector('.close-button').addEventListener('click', () => {
            resultsContainer.style.display = 'none';
            floatingButton.style.display = 'block';
        });

        // Add copy button listeners
        resultsContainer.querySelectorAll('.copy-button').forEach(btn => {
            btn.addEventListener('click', () => {
                copyToClipboard(btn.dataset.url);
            });
        });
    }

    function transformUrls() {
        let results = [];
        const currentUrl = window.location.href;

        if (currentUrl.includes('/UserSpace/CourseList.aspx')) {
            results = handleCourseList();
        } else if (currentUrl.includes('/PlayPages/')) {
            results = handlePlayPages();
        }

        displayResults(results);
    }

    function fillSubmitForm() {
        try {
            var rows = document.querySelectorAll('table  tr');
            rows.forEach(function(row) {
                var radios = row.querySelectorAll('input[type="radio"]');
                var isAnyRadioChecked = Array.from(radios).some(radio => radio.checked);
                if (!isAnyRadioChecked && radios.length > 0) {
                    radios[0].checked = true;
                }
            });
            var texts = document.querySelectorAll('textarea');
            texts.forEach(function(ta) {
                if (ta.value.trim() === '') {
                    ta.value = '无' + ' '.repeat(15);
                } else if (ta.value.length < 15) {
                    ta.value += ' '.repeat(15 - ta.value.length);
                }
            })
            document.getElementById("sb1").click();
        } catch {}
        document.getElementById("regfrm").submit();
    }

    // Initialize appropriate features based on current page
    const currentUrl = window.location.href;
    let floatingButton;

    if (currentUrl.includes('ucas.smartclass.cn')) {
        // Create video URL transform button for video pages
        floatingButton = createButton(transformUrls);
    } else if (currentUrl.includes('jwxk.ucas.ac.cn/evaluate')) {
        // Create course selection submit button
        floatingButton = createButton(fillSubmitForm);
    }
})();
