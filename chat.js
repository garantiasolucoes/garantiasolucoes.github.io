/* Chat de atendimento da Garantia Soluções (gerado a partir de site/chat_modelo.js).
   Fala com o servidor do atendimento: https://garantiasolucoes.duckdns.org */
(function () {
  "use strict";
  if (window.__gsChat) return;
  window.__gsChat = true;

  var API = "https://garantiasolucoes.duckdns.org";
  var WHATSAPP = "https://wa.me/558234368060";
  var CHAVE = "gs_chat_sid";
  var MAX_PDF = 15 * 1024 * 1024;
  var sid = "";
  var proximo = 0;
  var vistos = {};
  var aberto = false, ocupado = false, iniciado = false, aceitaArquivo = false;
  var timerNovas = null, ultimoUso = Date.now();

  function ler(k) { try { return window.localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function gravar(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }

  var css = [
    ".gs-bt{position:fixed;right:22px;bottom:96px;z-index:60;display:flex;align-items:center;gap:9px;border:0;cursor:pointer;",
    "background:#0B4DB3;color:#fff;border-radius:999px;padding:13px 18px 13px 15px;font:700 15px/1 Montserrat,system-ui,sans-serif;",
    "box-shadow:0 12px 30px rgba(0,0,0,.35)}",
    ".gs-bt:hover{background:#0A3F92}.gs-bt svg{width:22px;height:22px;flex:none}",
    ".gs-bt:focus-visible,.gs-p button:focus-visible,.gs-p textarea:focus-visible{outline:3px solid #5BD27A;outline-offset:2px}",
    ".gs-dica{position:fixed;right:22px;bottom:150px;z-index:60;max-width:250px;background:#fff;color:#0F1E36;border-radius:14px;",
    "padding:12px 14px;font:500 14.5px/1.4 Barlow,system-ui,sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.3);cursor:pointer}",
    ".gs-p{position:fixed;right:22px;bottom:22px;z-index:70;width:380px;max-width:calc(100vw - 32px);height:min(620px,calc(100vh - 44px));",
    "display:flex;flex-direction:column;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 24px 70px rgba(3,20,55,.5);",
    "font:15px/1.45 Barlow,system-ui,sans-serif;color:#0F1E36}",
    ".gs-p[hidden],.gs-bt[hidden],.gs-dica[hidden]{display:none}",
    ".gs-cab{display:flex;align-items:center;gap:12px;padding:14px 14px 14px 18px;background:#041633;color:#fff}",
    ".gs-cab b{display:block;font:800 16px/1.2 Montserrat,system-ui,sans-serif}",
    ".gs-cab small{display:block;color:#B9C9E4;font-size:13px}",
    ".gs-cab .gs-on{width:9px;height:9px;border-radius:50%;background:#5BD27A;box-shadow:0 0 0 4px rgba(91,210,122,.2);flex:none}",
    ".gs-fechar{margin-left:auto;background:transparent;border:0;color:#fff;font-size:26px;line-height:1;cursor:pointer;padding:4px 8px}",
    ".gs-msgs{flex:1;overflow-y:auto;padding:16px 14px;background:#F2F6FC;display:flex;flex-direction:column;gap:8px}",
    ".gs-m{max-width:85%;padding:9px 13px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}",
    ".gs-r{align-self:flex-start;background:#fff;border:1px solid #E1E8F2;border-bottom-left-radius:4px}",
    ".gs-c{align-self:flex-end;background:#2E9E46;color:#fff;border-bottom-right-radius:4px}",
    ".gs-r a{color:#0B4DB3;font-weight:600}",
    ".gs-dig{align-self:flex-start;color:#5A6A82;font-size:13.5px;padding:2px 4px}",
    ".gs-ops{align-self:flex-start;display:flex;flex-wrap:wrap;gap:6px;max-width:92%;margin-top:-2px}",
    ".gs-op{border:1.5px solid #0B4DB3;background:#fff;color:#0B4DB3;border-radius:999px;padding:7px 14px;",
    "font:600 14.5px/1.2 Barlow,system-ui,sans-serif;cursor:pointer}",
    ".gs-op:hover{background:#0B4DB3;color:#fff}.gs-op:disabled{opacity:.5;cursor:default}",
    ".gs-pe{display:flex;align-items:flex-end;gap:8px;padding:10px;border-top:1px solid #E1E8F2;background:#fff}",
    ".gs-pe textarea{flex:1;resize:none;border:1.5px solid #E1E8F2;border-radius:12px;padding:10px 12px;font:inherit;max-height:110px;",
    "min-height:44px;color:#0F1E36;background:#fff}",
    ".gs-pe textarea:focus{outline:none;border-color:#2F80ED}",
    ".gs-pe button{flex:none;width:44px;height:44px;border-radius:12px;border:0;cursor:pointer;display:grid;place-items:center}",
    ".gs-env{background:#2E9E46;color:#fff}.gs-env:disabled{opacity:.5;cursor:default}",
    ".gs-clip{background:#E8F0FD;color:#0B4DB3}.gs-clip[hidden]{display:none}",
    ".gs-pe svg{width:22px;height:22px}",
    ".gs-rod{font-size:11.5px;color:#5A6A82;text-align:center;padding:0 10px 8px;background:#fff}",
    ".gs-ini{flex:1;overflow-y:auto;overflow-x:hidden;padding:18px 18px 10px;background:#F2F6FC}",
    ".gs-ini[hidden],.gs-msgs[hidden],.gs-pe[hidden]{display:none}",
    ".gs-ini p{margin:0 0 14px;color:#0F1E36}",
    ".gs-ini label{display:block;font-weight:600;font-size:14px;color:#062A63;margin:12px 0 5px}",
    ".gs-ini input[type=text],.gs-ini input[type=tel]{width:100%;box-sizing:border-box;border:1.5px solid #E1E8F2;border-radius:10px;",
    "padding:11px 12px;font:inherit;font-size:16px;color:#0F1E36;background:#fff}",
    ".gs-ini input:focus{outline:none;border-color:#2F80ED}",
    ".gs-ini input.gs-err{border-color:#E5383B}",
    ".gs-ini .gs-tel{display:flex;gap:8px}",
    ".gs-ini .gs-tel input.gs-ddd{width:76px;flex:none;text-align:center}",
    ".gs-ini .gs-tel input#gs-cel{flex:1;min-width:0;width:auto}",
    ".gs-ck{display:flex;align-items:center;gap:9px;margin:16px 0 4px;font-size:14.5px;color:#0F1E36;cursor:pointer}",
    ".gs-ck input{width:18px;height:18px;accent-color:#2E9E46}",
    ".gs-msg-err{min-height:20px;color:#C62828;font-size:13.5px;margin:10px 0 0}",
    ".gs-comecar{width:100%;margin-top:12px;border:0;border-radius:12px;padding:14px;background:#2E9E46;color:#fff;",
    "font:700 16px/1 Montserrat,system-ui,sans-serif;cursor:pointer}",
    ".gs-comecar:disabled{opacity:.5;cursor:default}",
    "@media (max-width:600px){.gs-bt{right:16px;bottom:86px;padding:12px 15px 12px 13px;font-size:14px}",
    ".gs-dica{right:16px;bottom:136px}",
    ".gs-p{right:0;bottom:0;width:100%;max-width:100%;height:100%;border-radius:0}}"
  ].join("");

  var icChat = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14.5h4"/></svg>';
  var icEnv = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
  var icClip = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5 12.5 20a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9"/></svg>';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }

  var estilo = el("style");
  estilo.textContent = css;
  document.head.appendChild(estilo);

  var bt = el("button", "gs-bt", icChat + "<span>Análise grátis</span>");
  bt.type = "button";
  bt.setAttribute("aria-label", "Abrir o atendimento: análise gratuita do seu contrato");
  var dica = el("div", "gs-dica");
  dica.textContent = "Quer saber se a sua parcela está alta demais? Faça a análise gratuita do seu contrato aqui.";
  dica.hidden = true;

  var p = el("section", "gs-p");
  p.hidden = true;
  p.setAttribute("role", "dialog");
  p.setAttribute("aria-label", "Atendimento Garantia Soluções");
  p.innerHTML =
    '<div class="gs-cab"><span class="gs-on"></span><div><b>Garantia Soluções</b><small>Atendimento virtual · análise gratuita</small></div>' +
    '<button type="button" class="gs-fechar" aria-label="Fechar">×</button></div>' +
    '<form class="gs-ini" novalidate><p>Para começar o atendimento, preencha:</p>' +
    '<label for="gs-nome">Nome completo</label><input type="text" id="gs-nome" autocomplete="name" maxlength="120" placeholder="Ex.: João da Silva">' +
    '<label for="gs-ddd">WhatsApp</label><div class="gs-tel">' +
    '<input type="tel" id="gs-ddd" class="gs-ddd" inputmode="numeric" maxlength="2" placeholder="DDD" aria-label="DDD (2 números)">' +
    '<input type="tel" id="gs-cel" inputmode="numeric" maxlength="9" placeholder="Celular (9 números)" aria-label="Celular com 9 números"></div>' +
    '<label class="gs-ck"><input type="checkbox" id="gs-ja"> Já sou cliente da Garantia Soluções</label>' +
    '<div class="gs-msg-err" role="alert"></div>' +
    '<button type="submit" class="gs-comecar">Começar atendimento</button></form>' +
    '<div class="gs-msgs" aria-live="polite" hidden></div>' +
    '<form class="gs-pe" hidden><button type="button" class="gs-clip" aria-label="Enviar o contrato (PDF ou fotos)" title="Enviar o contrato" hidden>' + icClip + '</button>' +
    '<textarea rows="1" placeholder="Escreva aqui…" aria-label="Sua mensagem" maxlength="1000"></textarea>' +
    '<button type="submit" class="gs-env" aria-label="Enviar">' + icEnv + '</button>' +
    '<input type="file" accept="application/pdf,image/*" multiple hidden></form>' +
    '<div class="gs-rod">Atendimento automático. Seus dados são tratados conforme a LGPD.</div>';
  document.body.appendChild(dica);
  document.body.appendChild(bt);
  document.body.appendChild(p);

  var caixa = p.querySelector(".gs-msgs");
  var ini = p.querySelector(".gs-ini");
  var fNome = p.querySelector("#gs-nome"), fDdd = p.querySelector("#gs-ddd"), fCel = p.querySelector("#gs-cel");
  var fJa = p.querySelector("#gs-ja"), fErro = p.querySelector(".gs-msg-err"), fBotao = p.querySelector(".gs-comecar");
  var form = p.querySelector("form.gs-pe");
  var campo = p.querySelector("textarea");
  var envia = p.querySelector(".gs-env");
  var clip = p.querySelector(".gs-clip");
  var arquivo = p.querySelector("input[type=file]");
  var digitando = el("div", "gs-dig");
  digitando.textContent = "digitando…";

  function rolar() { caixa.scrollTop = caixa.scrollHeight; }

  function balao(de, texto) {
    var m = el("div", "gs-m " + (de === "cliente" ? "gs-c" : "gs-r"));
    if (de === "cliente" && /^\[arquivo enviado/.test(texto)) texto = "📎 Arquivo enviado";
    // só links do WhatsApp viram link
    var partes = String(texto).split(/(https:\/\/wa\.me\/\d{8,15})/);
    for (var i = 0; i < partes.length; i++) {
      if (i % 2 === 1) {
        var a = el("a");
        a.href = partes[i];
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "Falar no WhatsApp";
        m.appendChild(a);
      } else if (partes[i]) {
        m.appendChild(document.createTextNode(partes[i]));
      }
    }
    caixa.appendChild(m);
    rolar();
  }

  // botões de resposta rápida: só os da última mensagem do robô ficam na tela
  var ops = null;
  function tirarOpcoes() { if (ops && ops.parentNode) ops.parentNode.removeChild(ops); ops = null; }
  function opcoes(lista) {
    tirarOpcoes();
    ops = el("div", "gs-ops");
    lista.forEach(function (b) {
      var x = el("button", "gs-op");
      x.type = "button";
      x.textContent = b.titulo;
      x.addEventListener("click", function () { if (!ocupado) { tirarOpcoes(); mandar(b.titulo, b.id); } });
      ops.appendChild(x);
    });
    caixa.appendChild(ops);
    rolar();
  }

  function mostrar(r) {
    if (!r) return;
    if (r.sid) { sid = r.sid; gravar(CHAVE, sid); }
    var ultima = null;
    (r.mensagens || []).forEach(function (m) {
      if (vistos[m.id]) return;
      vistos[m.id] = true;
      tirarOpcoes();
      balao(m.de, m.texto);
      ultima = m;
      if (m.id + 1 > proximo) proximo = m.id + 1;
    });
    if (ultima && ultima.de === "robo" && ultima.botoes && ultima.botoes.length) opcoes(ultima.botoes);
    aceitaArquivo = !!r.aceita_arquivo;
    clip.hidden = !aceitaArquivo;
    if (r.etapa === "indisponivel") { campo.disabled = true; envia.disabled = true; }
  }

  function pedir(metodo, caminho, corpo, tipo) {
    var op = { method: metodo, headers: {} };
    if (corpo !== undefined) {
      op.body = corpo;
      op.headers["Content-Type"] = tipo || "application/json";
    }
    return fetch(API + caminho, op).then(function (resp) {
      return resp.json().catch(function () { return {}; }).then(function (j) {
        if (!resp.ok) { var e = new Error(j.erro || "erro"); e.publico = j.erro; throw e; }
        return j;
      });
    });
  }

  function falha(e) {
    balao("robo", (e && e.publico) ? e.publico :
      "Não consegui me conectar agora. Tente de novo em instantes" + (WHATSAPP ? " ou fale com a gente pelo WhatsApp: " + WHATSAPP : "."));
  }

  function espera(sim) {
    ocupado = sim;
    envia.disabled = sim;
    if (sim) { caixa.appendChild(digitando); rolar(); }
    else if (digitando.parentNode) digitando.parentNode.removeChild(digitando);
  }

  function modoConversa() {
    ini.hidden = true;
    caixa.hidden = false;
    form.hidden = false;
  }

  function modoFormulario() {
    ini.hidden = false;
    caixa.hidden = true;
    form.hidden = true;
    setTimeout(function () { fNome.focus(); }, 50);
  }

  function nomeOk(v) { return /^[A-Za-zÀ-ÿ' .-]{5,120}$/.test(v.trim()) && v.trim().split(/\s+/).length >= 2; }
  function soNumeros(el, max) { el.value = el.value.replace(/\D/g, "").slice(0, max); }
  // confere cada campo ao sair dele e mostra na hora o que está errado
  function erroDe(el) {
    if (el === fNome) return nomeOk(fNome.value) ? "" : "Escreva o seu nome completo, com sobrenome.";
    if (el === fDdd) return /^[1-9][1-9]$/.test(fDdd.value) ? "" : "O DDD tem 2 números (por exemplo: 82).";
    return /^9\d{8}$/.test(fCel.value) ? "" : "O celular tem 9 números e começa com 9 (faltam " +
      Math.max(0, 9 - fCel.value.length) + ").";
  }
  function marcar(el) {
    var e = el.value ? erroDe(el) : "";
    el.classList.toggle("gs-err", !!e);
    fErro.textContent = e;
    return !e;
  }
  function conferir() {
    var ok = !erroDe(fNome) && !erroDe(fDdd) && !erroDe(fCel);
    fBotao.disabled = false;
    return ok;
  }
  fDdd.addEventListener("input", function () { soNumeros(fDdd, 2); fDdd.classList.remove("gs-err"); if (fDdd.value.length === 2) fCel.focus(); });
  fCel.addEventListener("input", function () { soNumeros(fCel, 9); fCel.classList.remove("gs-err"); if (fCel.value.length === 9) marcar(fCel); });
  fNome.addEventListener("input", function () { fNome.classList.remove("gs-err"); });
  [fNome, fDdd, fCel].forEach(function (el) { el.addEventListener("blur", function () { marcar(el); }); });

  ini.addEventListener("submit", function (e) {
    e.preventDefault();
    fErro.textContent = "";
    [fNome, fDdd, fCel].forEach(function (x) { x.classList.remove("gs-err"); });
    var ruim = [fNome, fDdd, fCel].filter(function (el) { return erroDe(el); })[0];
    if (ruim) { fErro.textContent = erroDe(ruim); ruim.classList.add("gs-err"); ruim.focus(); return; }
    fBotao.disabled = true;
    fBotao.textContent = "Aguarde…";
    pedir("POST", "/api/iniciar", JSON.stringify({ nome: fNome.value.trim(), ddd: fDdd.value, celular: fCel.value, ja_cliente: fJa.checked }))
      .then(function (r) { iniciado = true; modoConversa(); mostrar(r); vigiar(); campo.focus(); })
      .catch(function (err) {
        fBotao.textContent = "Começar atendimento";
        conferir();
        fErro.textContent = (err && err.publico) ? err.publico : "Não consegui me conectar agora. Tente de novo em instantes.";
      });
  });

  function iniciar() {
    if (iniciado) return;
    var antigo = ler(CHAVE);
    if (!antigo) { modoFormulario(); return; }
    // já conversou antes neste aparelho: retoma a mesma conversa
    pedir("POST", "/api/retomar", JSON.stringify({ sid: antigo }))
      .then(function (r) { iniciado = true; modoConversa(); mostrar(r); vigiar(); })
      .catch(function () { modoFormulario(); });
  }

  function vigiar() {
    if (timerNovas) clearInterval(timerNovas);
    timerNovas = setInterval(function () {
      if (!aberto || !sid || ocupado) return;
      if (Date.now() - ultimoUso > 20 * 60 * 1000) return;
      pedir("GET", "/api/novas?sid=" + encodeURIComponent(sid) + "&desde=" + proximo)
        .then(mostrar).catch(function () {});
    }, 5000);
  }

  function abrir() {
    aberto = true;
    ultimoUso = Date.now();
    p.hidden = false;
    bt.hidden = true;
    dica.hidden = true;
    iniciar();
    if (iniciado) setTimeout(function () { campo.focus(); }, 50);
  }

  function fechar() {
    aberto = false;
    p.hidden = true;
    bt.hidden = false;
    bt.focus();
  }

  bt.addEventListener("click", abrir);
  dica.addEventListener("click", abrir);
  p.querySelector(".gs-fechar").addEventListener("click", fechar);
  p.addEventListener("keydown", function (e) { if (e.key === "Escape") fechar(); });

  campo.addEventListener("input", function () {
    campo.style.height = "auto";
    campo.style.height = Math.min(campo.scrollHeight, 110) + "px";
  });
  campo.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : enviar(e); }
  });

  function enviar(e) {
    if (e) e.preventDefault();
    var t = campo.value.replace(/^\s+|\s+$/g, "");
    if (!t || ocupado || !sid) return;
    campo.value = "";
    campo.style.height = "auto";
    mandar(t, null);
  }

  function mandar(t, botao) {
    ultimoUso = Date.now();
    tirarOpcoes();
    var temp = el("div", "gs-m gs-c");
    temp.textContent = t;
    caixa.appendChild(temp);
    espera(true);
    pedir("POST", "/api/mensagem", JSON.stringify(botao ? { sid: sid, texto: t, botao: botao } : { sid: sid, texto: t }))
      .then(function (r) {
        espera(false);
        // a mensagem do cliente volta do servidor: troca o balão provisório pelo oficial
        if (temp.parentNode) temp.parentNode.removeChild(temp);
        mostrar(r);
      })
      .catch(function (err) { espera(false); falha(err); });
  }
  form.addEventListener("submit", enviar);

  clip.addEventListener("click", function () { arquivo.click(); });

  function reduzirFoto(f) {
    return new Promise(function (ok, erro) {
      var url = URL.createObjectURL(f);
      var img = new Image();
      img.onload = function () {
        var lado = 2000, w = img.naturalWidth, h = img.naturalHeight;
        var esc = Math.min(1, lado / Math.max(w, h));
        var cv = document.createElement("canvas");
        cv.width = Math.round(w * esc);
        cv.height = Math.round(h * esc);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { b ? ok(b) : erro(new Error("foto")); }, "image/jpeg", 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); erro(new Error("foto")); };
      img.src = url;
    });
  }

  arquivo.addEventListener("change", function () {
    var lista = Array.prototype.slice.call(arquivo.files || []);
    arquivo.value = "";
    if (!lista.length || !sid) return;
    ultimoUso = Date.now();
    espera(true);
    var cadeia = Promise.resolve();
    lista.forEach(function (f) {
      cadeia = cadeia.then(function () {
        if (f.type === "application/pdf") {
          if (f.size > MAX_PDF) { balao("robo", "O PDF " + f.name + " passa de 15 MB. Tente mandar fotos das páginas."); return; }
          return pedir("POST", "/api/arquivo?sid=" + encodeURIComponent(sid), f, "application/pdf").then(mostrar);
        }
        if (/^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name)) {
          return reduzirFoto(f).then(function (b) {
            return pedir("POST", "/api/arquivo?sid=" + encodeURIComponent(sid), b, "image/jpeg").then(mostrar);
          }, function () {
            balao("robo", "Não consegui abrir a foto " + f.name + ". Tente tirar de novo ou mande em PDF.");
          });
        }
        balao("robo", "O arquivo " + f.name + " não é PDF nem foto.");
      }).catch(falha);
    });
    cadeia.then(function () { espera(false); }, function () { espera(false); });
  });

  // dica uma vez por visita, depois de alguns segundos
  setTimeout(function () {
    var ja = "";
    try { ja = window.sessionStorage.getItem("gs_dica") || ""; } catch (e) {}
    if (!ja && !aberto) {
      dica.hidden = false;
      try { window.sessionStorage.setItem("gs_dica", "1"); } catch (e) {}
      setTimeout(function () { dica.hidden = true; }, 12000);
    }
  }, 9000);
})();
