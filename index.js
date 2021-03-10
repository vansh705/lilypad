const got = require("got");
const cheerio = require("cheerio");
const http = require("http");
const fs = require("fs");
const { parse } = require("url");
const port = process.env.PORT || 32333;

http.createServer(requestListner).listen(port);
console.log("[i] listening on port " + port);

function requestListner(request, response) {
    var url = parse(request.url, true);
    if (url.pathname.startsWith("/api")) {
        var p = url.pathname.split("/").slice(2);
        switch (p[0]) {
            case "bypass":
                if (url.query.url) {
                    var u = Buffer.from(url.query.url, "base64").toString("ascii");
                    var requestedUrl = parse(u, true);
                    switch(requestedUrl.hostname) {
                        case "adshrink.it":
                            got(requestedUrl.href, {
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
                                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                                    "Accept-Language": "en-US,en;q=0.5",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "DNT": "1",
                                    "Connection": "keep-alive",
                                    "Upgrade-Insecure-Requests": "1"
                                }
                            }).then(function(resp) {
                                var $ = cheerio.load(resp.body);
                                for (var c in $("script")) {
                                    if (
                                        $("script")[c] == undefined || 
                                        $("script")[c].children == undefined || 
                                        $("script")[c].children[0] == undefined || 
                                        $("script")[c].children[0].data == undefined
                                    ) {continue;} else {
                                        if ($("script")[c].children[0].data.includes("_sharedData")) {
                                            var json = $("script")[c].children[0].data.split("_sharedData = ")[1].split("};")[0]
                                            json = JSON.parse(json + "}");
                                            json = JSON.parse(json[0].metadata);
                                            json = json.url;
                                            response.writeHead(200, {
                                                "Content-Type": "application/json",
                                                "Access-Control-Allow-Origin": "*"
                                            });
                                            var j = JSON.stringify({
                                                "success": true,
                                                "url": json
                                            });
                                            response.end(j);
                                        } else {
                                            continue;
                                        }  
                                    } 
                                }
                            }).catch(function(error) {
                                response.writeHead(500, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                var j = JSON.stringify({
                                    "success": false,
                                    "err": {
                                        "code": error.code,
                                        "stack": error.stack,
                                        "message": error.message
                                    }
                                });
                                response.end(j);
                            });
                        return;

                        case "linkvertise.com":
                        case "linkvertise.net":
                        case "up-to-down.net":
                        case "link-to.net":
                        case "direct-link.net":
                            var uu = "https://publisher.linkvertise.com/api/v1/redirect/link/static" + requestedUrl.pathname;
                            got(uu, { 
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
                                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                                    "Accept-Language": "en-US,en;q=0.5",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "DNT": "1",
                                    "Connection": "keep-alive",
                                    "Upgrade-Insecure-Requests": "1",
                                    "Sec-GPC": "1",
                                    "Cache-Control": "max-age=0",
                                    "TE": "Trailers"
                                }
                            }).then(function(resp) {
                                var j = JSON.parse(resp.body);
                                var id = j.data.link.id;
                                var serial = JSON.stringify({
                                    timestamp: new Date() * 1,
                                    random: "6548307",
                                    link_id: id
                                });
                                serial = Buffer.from(serial).toString("base64");
                                var uu2 = "https://publisher.linkvertise.com/api/v1/redirect/link" + requestedUrl.pathname + "/target?serial=" + serial;
                                got(uu2, {
                                    headers: {
                                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
                                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                                        "Accept-Language": "en-US,en;q=0.5",
                                        "Accept-Encoding": "gzip, deflate, br",
                                        "DNT": "1",
                                        "Connection": "keep-alive",
                                        "Upgrade-Insecure-Requests": "1",
                                        "Sec-GPC": "1",
                                        "Cache-Control": "max-age=0",
                                        "TE": "Trailers"
                                    }
                                }).then(function(resp) {
                                    var json = JSON.parse(resp.body);
                                    response.writeHead(200, {
                                        "Content-Type": "application/json",
                                        "Access-Control-Allow-Origin": "*"
                                    });
                                    var j = JSON.stringify({
                                        "success": true,
                                        "url": json.data.target
                                    });
                                    response.end(j);
                                }).catch(function(error) {
                                    response.writeHead(500, {
                                        "Access-Control-Allow-Origin": "*",
                                        "Content-Type": "application/json"
                                    });
                                    var j = JSON.stringify({
                                        "success": false,
                                        "err": {
                                            "code": error.code,
                                            "stack": error.stack,
                                            "message": error.message
                                        }
                                    });
                                    response.end(j);
                                });
                            }).catch(function(error) {
                                response.writeHead(500, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                var j = JSON.stringify({
                                    "success": false,
                                    "err": {
                                        "code": error.code,
                                        "stack": error.stack,
                                        "message": error.message
                                    }
                                });
                                response.end(j);
                            });
                        return;

                        case "t.co":
                            got(requestedUrl.href, {
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
                                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                                    "Accept-Language": "en-US,en;q=0.5",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "DNT": "1",
                                    "Connection": "keep-alive",
                                    "Upgrade-Insecure-Requests": "1"
                                }
                            }).then(function(resp) {
                                var $ = cheerio.load(resp.body);
                                console.log(resp.body)
                                var r = $("script")[0].children[0].data;
                                r = r.split('replace("')[1];
                                r = r.split('"').slice(0, (r.split('"').length - 1)).join('"');
                                r = r.split("\\").join("");
                                var j = JSON.stringify({
                                    "success": true,
                                    "url": r
                                });
                                response.writeHead(200, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                response.end(j);
                            }).catch(function(error) {
                                response.writeHead(500, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                var j = JSON.stringify({
                                    "success": false,
                                    "err": {
                                        "code": error.code,
                                        "stack": error.stack,
                                        "message": error.message
                                    }
                                });
                                response.end(j);
                            });
                        return;

                        case "www.shortly.xyz":
                        case "shortly.xyz":
                            got(u, {
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
                                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                                    "Accept-Language": "en-US,en;q=0.5",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "DNT": "1",
                                    "Connection": "keep-alive",
                                    "Upgrade-Insecure-Requests": "1"
                                }
                            }).then(function(resp) {
                                var $ = cheerio.load(resp.body);
                                var i = $("form input").attr("value");
                                i = "id=" + i;
                                got.post("https://shortly.xyz/getlink.php", {
                                    body: i,
                                    headers: {
                                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
                                        "Accept": "*/*",
                                        "Accept-Language": "en-US,en;q=0.5",
                                        "Accept-Encoding": "gzip, deflate, br",
                                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                                        "X-Requested-With": "XMLHttpRequest",
                                        "Content-Length": totalBytes(i),
                                        "Origin": "https://www.shortly.xyz",
                                        "Connection": "keep-alive",
                                        "Referer": "https://www.shortly.xyz",
                                        "DNT": "1"
                                    }
                                }).then(function(resp) {
                                    var j = JSON.stringify({
                                        "success": true,
                                        "url": resp.body
                                    });
                                    response.writeHead(200, {
                                        "Access-Control-Allow-Origin": "*",
                                        "Content-Type": "application/json"
                                    });
                                    response.end(j);
                                }).catch(function(error) {
                                    response.writeHead(500, {
                                        "Access-Control-Allow-Origin": "*",
                                        "Content-Type": "application/json"
                                    });
                                    var j = JSON.stringify({
                                        "success": false,
                                        "err": {
                                            "code": error.code,
                                            "stack": error.stack,
                                            "message": error.message
                                        }
                                    });
                                    response.end(j);
                                })
                            }).catch(function(error) {
                                response.writeHead(500, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                var j = JSON.stringify({
                                    "success": false,
                                    "err": {
                                        "code": error.code,
                                        "stack": error.stack,
                                        "message": error.message
                                    }
                                });
                                response.end(j);
                            });
                        return;

                        case "sub2unlock.com":
                        case "www.sub2unlock.com":
                        case "sub2unlock.net":
                        case "www.sub2unlock.net":
                            got(requestedUrl.href, {
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
                                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                                    "Accept-Language": "en-US,en;q=0.5",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "DNT": "1",
                                    "Connection": "keep-alive",
                                    "Upgrade-Insecure-Requests": "1"
                                }
                            }).then(function(resp) {
                                var $ = cheerio.load(resp.body);
                                var j = JSON.stringify({
                                    "success": true,
                                    "url": $("#theGetLink").text()
                                });
                                response.writeHead(200, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                response.end(j);
                            }).catch(function(error) {
                                response.writeHead(500, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                var j = JSON.stringify({
                                    "success": false,
                                    "err": {
                                        "code": error.code,
                                        "stack": error.stack,
                                        "message": error.message
                                    }
                                });
                                response.end(j);
                            });
                        return;

                        case "www.shortconnect.com":
                        case "shortconnect.com":
                            got(requestedUrl.href, {
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
                                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                                    "Accept-Language": "en-US,en;q=0.5",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "DNT": "1",
                                    "Connection": "keep-alive",
                                    "Upgrade-Insecure-Requests": "1"
                                }
                            }).then(function(resp) {
                                var $ = cheerio.load(resp.body);
                                var j = JSON.stringify({
                                    "success": true,
                                    "url": $("#loader-link")[0].attribs.href
                                });
                                response.writeHead(200, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                response.end(j);
                            }).catch(function(error) {
                                response.writeHead(500, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                var j = JSON.stringify({
                                    "success": false,
                                    "err": {
                                        "code": error.code,
                                        "stack": error.stack,
                                        "message": error.message
                                    }
                                });
                                response.end(j);
                            });
                        return;

                        case "boost.ink":
                        case "bst.wtf":
                        case "booo.st":
                        case "bst.gg":
                            got(requestedUrl.href, {
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
                                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                                    "Accept-Language": "en-US,en;q=0.5",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "DNT": "1",
                                    "Connection": "keep-alive",
                                    "Upgrade-Insecure-Requests": "1"
                                }
                            }).then(function(resp) {
                                var $ = cheerio.load(resp.body);
                                for (var c in $("script")) {
                                    if (
                                        $("script")[c] !== undefined &&
                                        $("script")[c].attribs !== undefined &&
                                        $("script")[c].attribs.version !== undefined
                                    ) {
                                        var r = Buffer.from($("script")[c].attribs.version, "base64");
                                        r = r.toString("ascii");
                                        var j = JSON.stringify({
                                            "success": true,
                                            "url": r
                                        });
                                        response.writeHead(200, {
                                            "Access-Control-Allow-Origin": "*",
                                            "Content-Type": "application/json"
                                        });
                                        response.end(j);
                                    } else {
                                        continue;
                                    }
                                }
                            }).catch(function(error) {
                                response.writeHead(500, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                var j = JSON.stringify({
                                    "success": false,
                                    "err": {
                                        "code": error.code,
                                        "stack": error.stack,
                                        "message": error.message
                                    }
                                });
                                response.end(j);
                            });
                        return;

                        case "adfoc.us":
                            got(requestedUrl.href, {
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
                                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                                    "Accept-Language": "en-US,en;q=0.5",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "DNT": "1",
                                    "Connection": "keep-alive",
                                    "Upgrade-Insecure-Requests": "1"
                                }
                            }).then(function(resp) {
                                var $ = cheerio.load(resp);
                                var j = JSON.stringify({
                                    "success": true,
                                    "url": $("#showSkip .skip")[0].attribs.href
                                });
                                response.writeHead(200, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                response.end(j);
                            }).catch(function(error) {
                                response.writeHead(500, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                var j = JSON.stringify({
                                    "success": false,
                                    "err": {
                                        "code": error.code,
                                        "stack": error.stack,
                                        "message": error.message
                                    }
                                });
                                response.end(j);
                            })

                        default:
                            got(requestedUrl.href, {
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
                                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                                    "Accept-Language": "en-US,en;q=0.5",
                                    "Accept-Encoding": "gzip, deflate, br",
                                    "DNT": "1",
                                    "Connection": "keep-alive",
                                    "Upgrade-Insecure-Requests": "1"
                                }
                            }).then(function(resp) {
                                if (resp.body.split("ysmm = ").length > 1) {
                                    // adfly detection
                                    let a, m, I = "",
                                        X = "",
                                        r = resp.body.split(`var ysmm = `)[1].split('\'')[1];
                                    for (m = 0; m < r.length; m++) {
                                        if (m % 2 == 0) {
                                            I += r.charAt(m);
                                        } else {
                                            X = r.charAt(m) + X;
                                        }
                                    }
                                    r = I + X;
                                    a = r.split("");
                                    for (m = 0; m < a.length; m++) {
                                        if (!isNaN(a[m])) {
                                            for (var R = m + 1; R < a.length; R++) {
                                                if (!isNaN(a[R])) {
                                                    let S = a[m] ^ a[R]
                                                    if (S < 10) {
                                                        a[m] = S
                                                    }
                                                    m = R
                                                    R = a.length
                                                }
                                            }
                                        }
                                    }
                                    r = a.join('')
                                    r = Buffer.from(r, 'base64').toString('ascii');
                                    r = r.substring(r.length - (r.length - 16));
                                    r = r.substring(0, r.length - 16);
                                    if (new URL(r).search.includes("dest=")) {
                                        r = decodeURIComponent(r.split('dest=')[1]);
                                    }
                                    response.writeHead(200, {
                                        "Access-Control-Allow-Origin": "*",
                                        "Content-Type": "application/json"
                                    });
                                    var j = JSON.stringify({
                                        "success": true,
                                        "url": r
                                    });
                                    response.end(j);
                                } else if (resp.url == u) {
                                    if (resp.redirects !== undefined && resp.redirects.length > 0) {
                                        var r = resp.redirects[resp.redirects.length - 1];
                                        response.writeHead(200, {
                                            "Access-Control-Allow-Origin": "*",
                                            "Content-Type": "application/json"
                                        });
                                        var j = JSON.stringify({
                                            "success": true,
                                            "url": r
                                        });
                                        response.end(j);
                                    } else {
                                        response.writeHead(500, {
                                            "Access-Control-Allow-Origin": "*",
                                            "Content-Type": "application/json"
                                        });
                                        var j = JSON.stringify({
                                            "success": false,
                                            "err": {
                                                "code": "noneFound",
                                                "message": "No redirects were found."
                                            }
                                        });
                                        response.end(j);
                                    }
                                } else {
                                    if (parse(resp.url, true).hostname == "preview.tinyurl.com") {
                                        var $ = cheerio.load(resp.body);
                                        var r = $("#redirecturl").attr("href");
                                        response.writeHead(200, {
                                            "Access-Control-Allow-Origin": "*",
                                            "Content-Type": "application/json"
                                        });
                                        var j = JSON.stringify({
                                            "success": true,
                                            "url": r
                                        });
                                        response.end(j);
                                    } else {
                                        response.writeHead(200, {
                                            "Access-Control-Allow-Origin": "*",
                                            "Content-Type": "application/json"
                                        });
                                        var j = JSON.stringify({
                                            "success": true,
                                            "url": resp.url
                                        });
                                        response.end(j);
                                    }
                                }
                            }).catch(function(error) {
                                response.writeHead(500, {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "application/json"
                                });
                                var j = JSON.stringify({
                                    "success": false,
                                    "err": {
                                        "code": error.code,
                                        "stack": error.stack,
                                        "message": error.message
                                    }
                                });
                                response.end(j);
                            });
                        return;
                    }
                } else {
                    response.writeHead(400, {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "application/json"
                    });
                    response.end(JSON.stringify({
                        "success": false,
                        "err": {
                            "code": "needUrl",
                            "message": "This endpoint requires a URL."
                        }
                    }))
                }
        }
    } else {
        if (fs.existsSync(__dirname + "/frontend" + url.pathname + "index.html")) {
            fs.readFile(__dirname + "/frontend" + url.pathname + "index.html", function(err, resp) {
                if (err) {
                    response.writeHead(500, {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "text/plain"
                    });
                    response.end(err.message);
                } else {
                    response.writeHead(200, {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "text/html"
                    });
                    response.end(resp);
                }
            })
        } else if (fs.existsSync(__dirname + "/frontend" + url.pathname)) {
            fs.readFile(__dirname + "/frontend" + url.pathname, function(err, resp) {
                if (err) {
                    response.writeHead(500, {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "text/plain"
                    });
                    response.end(err.message);
                } else {
                    response.writeHead(200, {
                        "Access-Control-Allow-Origin": "*"
                    });
                    response.end(resp);
                }
            });
        } else {
            response.writeHead(404, {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "text/plain"
            });
            response.end("404 - file not found");
        }
    }
}

function totalBytes(string) {
    return encodeURI(string).split(/%..|./).length - 1;
}