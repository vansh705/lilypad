document.getElementById("reqScript").style.display = "";
if (window.location.hash !== "") {document.getElementById("url").value = window.location.hash.substring(1); bypass();}

function bypass() {
    document.getElementById("success").style.display = "none";
    document.getElementById("fail").style.display = "none";
    var xhr = new XMLHttpRequest();
    var url = document.getElementById("url").value;
    url = btoa(url);
    url = encodeURIComponent(url);
    xhr.open("GET", "/api/bypass?url=" + url);
    xhr.send();
    xhr.onload = function () {
        var j = JSON.parse(xhr.responseText);
        if (j.success == true && j.url) {
            document.getElementById("success").style.display = "";
            document.getElementById("link").href = j.url;
            document.getElementById("link").innerHTML = j.url;
        } else {
            document.getElementById("fail").style.display = "";
            document.getElementById("errTxt").innerHTML = j.err.message;
        }
    }
}