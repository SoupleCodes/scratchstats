export function hyperLinkText(text, href) {
    const link = document.createElement('a');
    link.href = `?user=${href}`;
    link.textContent = text;
    return link;
}

export function findandReplaceMentions(text) {
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    return text.replace(mentionRegex, (_match, username) => {
        const link = hyperLinkText(`@${username}`, username);
        return link.outerHTML;
    })
}

export async function fetchUrl(url) {
    const res = await fetch('https://corsproxy.io/?url=' + encodeURIComponent(url));
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
}

export function sanitizeText(text) {
    const temp = document.createElement('div');
    temp.innerText = text;
    return temp.innerHTML;
}