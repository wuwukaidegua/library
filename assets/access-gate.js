(() => {
  const script = document.currentScript;
  const required = script?.dataset.access || "any";
  const labels = {
    group: "团课学生",
    one: "一对一学生",
    teacher: "老师自用",
    any: "资料库"
  };
  const levels = { group: 1, one: 2, teacher: 3 };
  const hashes = {
    group: "1fc4a77436907fc97ac56aebfa7f051f57f0778b8dba55bfc6bc31bcdb74de61",
    one: "d6d3ffeaebd034a55b6c8afa43be09738534e3ee5a9775535afddcf4248a0483",
    teacher: "448cc5994ac30776ed21706731b31e44e19edb858f970ad211e92b9151e677e8"
  };
  const roleNames = { group: "团课", one: "一对一", teacher: "老师" };
  const storageKey = "tarotAccessRole";
  const storedRole = localStorage.getItem(storageKey) || "";

  function allows(role, needed) {
    if (needed === "any") return !!levels[role];
    return (levels[role] || 0) >= (levels[needed] || 99);
  }

  function addStatus(role) {
    const status = document.createElement("button");
    status.type = "button";
    status.className = "access-status";
    status.textContent = `已记住：${roleNames[role] || labels[role] || "已登录"} · 退出`;
    status.title = "当前浏览器已记住登录状态，点击可退出";
    status.addEventListener("click", () => {
      localStorage.removeItem(storageKey);
      location.reload();
    });
    document.body.appendChild(status);
  }

  function injectStatusStyle() {
    const style = document.createElement("style");
    style.textContent = `
      .access-status {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 30;
        border: 1px solid #e2d6c9;
        border-radius: 999px;
        background: rgba(255, 253, 249, 0.94);
        color: #6f3f49;
        padding: 9px 13px;
        font: inherit;
        font-size: 13px;
        font-weight: 800;
        box-shadow: 0 8px 22px rgba(61, 47, 35, 0.12);
        cursor: pointer;
        backdrop-filter: blur(8px);
      }
    `;
    document.head.appendChild(style);
  }

  if (allows(storedRole, required)) {
    injectStatusStyle();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => addStatus(storedRole));
    } else {
      addStatus(storedRole);
    }
    return;
  }

  function renderGate(message = "") {
    document.body.innerHTML = `
      <main class="access-gate">
        <section class="access-box">
          <p class="eyebrow">ACCESS</p>
          <h1>${labels[required] || "资料库"}访问密码</h1>
          <p>请输入对应权限的密码。登录成功后，这台浏览器会自动记住状态；右下角可以随时退出。</p>
          <form id="accessForm">
            <input id="accessPassword" type="password" autocomplete="current-password" placeholder="输入访问密码" autofocus />
            <button type="submit">进入</button>
          </form>
          <p class="error" aria-live="polite">${message}</p>
          <p class="hint">老师密码可进入全部区域；一对一密码可进入一对一和团课区域；团课密码只进入共享内容。</p>
          <a href="./index.html">返回首页</a>
        </section>
      </main>
    `;
    const style = document.createElement("style");
    style.textContent = `
      body {
        min-height: 100vh;
        margin: 0;
        background:
          radial-gradient(circle at 20% 12%, rgba(107, 77, 116, 0.12), transparent 28rem),
          linear-gradient(160deg, #faf6ef 0%, #f4eee4 55%, #f9f5ee 100%);
        color: #302a25;
        font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", "Microsoft YaHei", "PingFang SC", serif;
        -webkit-font-smoothing: antialiased;
      }
      .access-gate {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        animation: gateIn 420ms ease both;
      }
      @keyframes gateIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .access-box {
        width: min(480px, 100%);
        display: grid;
        gap: 14px;
        padding: 28px;
        border: 1px solid #e8dccd;
        border-radius: 22px;
        background: rgba(255, 253, 249, 0.94);
        box-shadow: 0 18px 48px rgba(61, 47, 35, 0.10);
      }
      .access-box h1 { margin: 0; font-size: 30px; line-height: 1.25; letter-spacing: .4px; color: #241f1b; }
      .access-box p { margin: 0; color: #625a51; line-height: 1.85; }
      .eyebrow { color: #b8893f !important; font-size: 12px; font-weight: 900; letter-spacing: 2px; }
      form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; }
      input, button {
        border: 1px solid #d8d0c6;
        border-radius: 14px;
        padding: 12px 13px;
        font: inherit;
        background: #fff;
      }
      input:focus { outline: none; border-color: #6b4d74; box-shadow: 0 0 0 4px rgba(107,77,116,.1); }
      button {
        background: #496c63;
        color: #fff;
        font-weight: 800;
        cursor: pointer;
      }
      .error { color: #b45a68 !important; min-height: 1.5em; font-weight: 700; }
      .hint { font-size: 13px; color: #7c7168 !important; }
      a { color: #8c4d5a; font-weight: 800; }
      @media (max-width: 560px) { form { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);

    document.querySelector("#accessForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = document.querySelector("#accessPassword");
      const value = input.value.trim();
      if (!value) {
        renderGate("先输入密码，再点进入。");
        return;
      }
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
      const hash = Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
      const role = Object.keys(hashes).find(key => hashes[key] === hash);
      if (!role || !allows(role, required)) {
        renderGate("密码不对，或者这个密码没有当前区域权限。");
        return;
      }
      localStorage.setItem(storageKey, role);
      location.reload();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => renderGate());
  } else {
    renderGate();
  }
})();
