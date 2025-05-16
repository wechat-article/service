import mitmproxy.http
import mitmproxy.ctx
import json
from urllib.parse import urlparse, parse_qs
import time
from typing import Optional
import re


class ExtractSetCookie:
    def __init__(self):
        self.cookies = {}

    def running(self):
        print("running success", flush=True)

    def load(self, loader):
        loader.add_option(
            name="credentials",
            typespec=Optional[str],
            default="./credentials.json",
            help="指定 Credentials.json 文件路径",
        )

    def response(self, flow: mitmproxy.http.HTTPFlow):
        # 检查请求的 URL 是否符合过滤器
        if flow.request.url.startswith("https://mp.weixin.qq.com/s?__biz="):
            print(f"命中请求")

            # 提取 __biz 参数
            parsed_url = urlparse(flow.request.url)
            query_params = parse_qs(parsed_url.query)
            biz = query_params.get('__biz', [None])[0]
            if biz:
                # 提取响应头中的 Set-Cookie 数据
                set_cookie_header = flow.response.headers.get("Set-Cookie")

                # 提取响应正文（假设是文本格式）
                response_content = flow.response.text  # 获取解码后的文本内容

                # 提取昵称
                nickname_match = re.search(r'var nickname = htmlDecode\("([^"]+)"\);', response_content)
                nickname = nickname_match.group(1) if nickname_match else None

                # 提取头像
                round_head_img_match = re.search(r'var round_head_img = "([^"]+)";', response_content)
                round_head_img = round_head_img_match.group(1) if round_head_img_match else None

                if set_cookie_header:
                    timestamp = int(time.time() * 1000)
                    self.cookies[biz] = {
                        "biz": biz,
                        "url": flow.request.url,
                        "set_cookie": set_cookie_header,
                        "timestamp": timestamp,
                        "nickname": nickname,
                        "round_head_img": round_head_img,
                    }
                    # 将 cookies 数据保存到文件中
                    with open(mitmproxy.ctx.options.credentials, "w") as file:
                        json.dump(list(self.cookies.values()), file, indent=4)


addons = [
    ExtractSetCookie(),
]
