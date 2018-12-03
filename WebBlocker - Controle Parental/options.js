/*
Copyright:

    Copyright (C) 2018 Luis Zanella <zluisariel@gmail.com>

License:

    webBlocker is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.
*/

window.onload = function () {
	var gs = JSON.parse(localStorage.getItem('general_settings'));
	if (gs.password.hash.length > 0) {
		var input = window.prompt("Por favor, insira sua senha.", "");
		if (input != null && Crypto.SHA256(input) === gs.password.hash) {
			restore_options();
			document.body.style.display = "block !important";
		} else {
			document.body.innerHTML = "Acesso negado: a senha está incorreta.";
			document.body.style.display = "block !important";
			while (document.getElementsByTagName('script').length > 0) {
				document.head.removeChild(document.getElementsByTagName('script')[0]);
			}
		}
	} else {
		restore_options();
		document.body.style.display = "block !important";
	}
};

var Dom = {
	get: function (el) {
		if (typeof el === 'string') {
			return document.getElementById(el);
		} else {
			return el;
		}
	},
	add: function (el, dest) {
		var el = this.get(el);
		var dest = this.get(dest);
		dest.appendChild(el);
	},
	remove: function (el) {
		var el = this.get(el);
		el.parentNode.removeChild(el);
	}
};

var Event = {
	add: function () {
		if (window.addEventListener) {
			return function (el, type, fn) {
				Dom.get(el).addEventListener(type, fn, false);
			};
		} else if (window.attachEvent) {
			return function (el, type, fn) {
				var f = function () {
					fn.call(Dom.get(el), window.event);
				};
				Dom.get(el).attachEvent('on' + type, f);
			};
		}
	}()
};

Event.add(document, 'DOMContentLoaded', function () {
	Event.add('btn_pass', 'click', setPassword);
	Event.add('pwd_status', 'click', function () {
		Dom.get('btn_pass').disabled = !this.checked;
	});
	Event.add('btn_advSettings', 'click', function () {
		toogleList(null, 'adv_settings');
	});
	Event.add('lst_bs', 'click', function () {
		toogleList(Dom.get("lst_bs"), 'blocked_url');
	});
	Event.add('lst_bk', 'click', function () {
		toogleList(Dom.get("lst_bk"), 'blocked_word');
	});
	Event.add('lst_ts', 'click', function () {
		toogleList(Dom.get("lst_ts"), 'trusted_url');
	});
	Event.add('lst_pf', 'click', function () {
		toogleList(Dom.get("lst_pf"), 'profanity_word');
	});
	Event.add('btn_generate', 'click', genList);
	Event.add('btn_reset', 'click', reset_options);
	Event.add('btn_save', 'click', save_options);

	Event.add('add_url', 'click', function () {
		var keyword = Dom.get("url_content").value;
		if (!keyword) {
			alert("Por favor, insira uma URL para adicionar a lista");
			return false;
		}
		keyword = keyword.replace(/<(.|\n)+?>/g, '');
		if (keyword) {
			list_bs[list_bs.length] = keyword;
			populateList('blocked_url', keyword);
		} else { return false; }
	});

	Event.add('add_text', 'click', function () {
		var keyword = Dom.get("text_content").value;
		if (!keyword) {
			alert("Por favor, insira uma palavra para adicionar a lista");
			return false;
		}
		keyword = keyword.replace(/<(.|\n)+?>/g, '');
		if (keyword) {
			list_bw[list_bw.length] = keyword;
			populateList('blocked_word', keyword);
		} else { return false; }
	});

	Event.add('add_trust', 'click', function () {
		var keyword = Dom.get("trust_content").value;
		if (!keyword) {
			alert("Por favor, insira uma palavra para adicionar a lista");
			return false;
		}
		keyword = keyword.replace(/<(.|\n)+?>/g, '');
		if (keyword) {
			list_ts[list_ts.length] = keyword;
			populateList('trusted_url', keyword);
		} else { return false; }
	});

	/*Event.add('add_cf', 'click', function () {
		var bu = Dom.get("bu").checked,
			bw = Dom.get("bw").checked,
			au = Dom.get("au").checked;

		if (!(bu || bw || au)) {
			alert("Please select the type of keyword to add.");
			return false;
		}

		var keyword = Dom.get("keyword_cf").value;
		keyword = keyword.replace(/<(.|\n)+?>/g, '');

		if (bu) {
			list_bs[list_bs.length] = keyword;
			populateList('blocked_url', keyword);
		} else if (bw) {
			list_bw[list_bw.length] = keyword;
			populateList('blocked_word', keyword);
		} else if (au) {
			list_ts[list_ts.length] = keyword;
			populateList('trusted_url', keyword);
		} else { return false; }
	});*/
	Event.add('add_pf', 'click', function () {
		var keyword = Dom.get("keyword_pf").value;
		keyword = keyword.replace(/<(.|\n)+?>/g, '');
		list_pf[list_pf.length] = keyword;
		populateList('profanity_word', keyword);
	});
});

var populateList = function (list, keyword) {
	var el = document.createElement('p');
	var remove = document.createElement('span');
	remove.setAttribute('class', 'link');
	remove.innerHTML = ' [x]';
	el.innerHTML = keyword;
	Dom.add(remove, el);
	Dom.add(el, list);

	Event.add(remove, 'click', function (e) {
		var span = this.parentNode;
		var keyword = span.innerHTML.replace(/<(.*)?>/g, '');
		switch (span.parentNode.id) {
			case "blocked_url":
				removeKeyword(list_bs, keyword);
				break;

			case "blocked_word":
				removeKeyword(list_bw, keyword);
				break;

			case "trusted_url":
				removeKeyword(list_ts, keyword);
				break;

			case "profanity_word":
				removeKeyword(list_pf, keyword);
				break;

			default:
				break;
		}
		Dom.remove(span);
	});
}

var list_bs = list_bw = list_ts = list_pf = [], password = null;

var removeKeyword = function (list, keyword) {

	var len = list.length;
	while (len--) {

		// TODO: Fix bug where the last array items from
		//  defaults.txt do not have weird new line char.
		//  This string comparison fails because of it.
		if (list[len] == keyword) {
			list.splice(len, 1);
		}
	};

};

// Saves options
var save_options = function () {
	var content_filter = {
		enabled: Dom.get("cf_status").checked,
		advanced: {
			warning: Dom.get("adv_warning").value || "Esta página não está disponível devido a restrições de administrador.",
			stop_all: Dom.get("adv_stop").checked,
			reason: Dom.get("adv_reason").checked,
			redirect: (function () {
				var adv_redirect = Dom.get("adv_redirect").value || "",
					regex = /^(https?|ftp|file):\/\/.+$/i;
				if (adv_redirect.length > 0 && !regex.test(adv_redirect)) {
					adv_redirect = "http://" + adv_redirect;
				}
				return adv_redirect;
			})()
		},
		block: {
			sites: list_bs,
			words: list_bw
		},
		trust: {
			sites: list_ts
		}
	};

	var profanity_filter = {
		enabled: Dom.get("pf_status").checked,
		words: list_pf
	};

	var subscriptions = {
		enabled: Dom.get("ls_status").checked,
		url: Dom.get("ls_url").value,
		content_filter: {
			block: {},
			trust: {}
		},
		profanity_filter: {}
	};

	//reference to background.html
	var bg = chrome.extension.getBackgroundPage().tinyFilter_bg;

	if (subscriptions.url.length > 0) {
		if (subscriptions.url != bg.prefs.subscriptions.url) {
			var response = bg.loadSubscription(subscriptions.url);
			if (response) {
				subscriptions.content_filter.block.sites = (response.content_filter.block.sites) ? response.content_filter.block.sites : [];
				subscriptions.content_filter.block.words = (response.content_filter.block.words) ? response.content_filter.block.words : [];
				subscriptions.content_filter.trust.sites = (response.content_filter.trust.sites) ? response.content_filter.trust.sites : [];
				subscriptions.profanity_filter.words = (response.profanity_filter.words) ? response.profanity_filter.words : [];
				subscriptions.last_update = new Date().getTime();
				//alert(subscriptions.last_update);
			} else {
				subscriptions.enabled = false;
			}
		} else {
			subscriptions.content_filter.block.sites = bg.prefs.subscriptions.content_filter.block.sites;
			subscriptions.content_filter.block.words = bg.prefs.subscriptions.content_filter.block.words;
			subscriptions.content_filter.trust.sites = bg.prefs.subscriptions.content_filter.trust.sites;
			subscriptions.profanity_filter.words = bg.prefs.subscriptions.profanity_filter.words;
			subscriptions.last_update = (bg.prefs.subscriptions.last_update) ? bg.prefs.subscriptions.last_update : new Date().getTime();
		}
	} else {
		subscriptions.enabled = false;
	}

	var general_settings = {
		password: {
			hash: (Dom.get('pwd_status').checked) ? password : ""
		}
	};

	localStorage.setItem('content_filter', JSON.stringify(content_filter));
	localStorage.setItem('profanity_filter', JSON.stringify(profanity_filter));
	localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
	localStorage.setItem('general_settings', JSON.stringify(general_settings));

	//update background.html settings
	bg.prefs.content_filter = content_filter;
	bg.prefs.profanity_filter = profanity_filter;
	bg.prefs.subscriptions = subscriptions;
	bg.init();

	var status = Dom.get("status");
	status.removeAttribute("style");
	setTimeout(function () {
		status.setAttribute("style", "visibility:hidden");
	}, 750);
};

// Restores options
var restore_options = function () {
	//localStorage.clear();

	var cf = JSON.parse(localStorage.getItem('content_filter'));
	Dom.get("cf_status").checked = cf.enabled || false;
	Dom.get("adv_stop").checked = cf.advanced.stop_all || false;
	Dom.get("adv_reason").checked = cf.advanced.reason || false;
	Dom.get("adv_warning").value = cf.advanced.warning;
	Dom.get("adv_redirect").value = cf.advanced.redirect;

	var pf = JSON.parse(localStorage.getItem('profanity_filter'));
	Dom.get("pf_status").checked = pf.enabled || false;

	var ls = JSON.parse(localStorage.getItem('subscriptions'));
	Dom.get("ls_status").checked = ls.enabled || false;
	Dom.get("ls_url").value = ls.url || "";

	var gs = JSON.parse(localStorage.getItem('general_settings'));
	password = gs.password.hash;
	Dom.get("pwd_status").checked = (gs.password.hash.length > 0) ? true : false;
	Dom.get("btn_pass").disabled = !Dom.get("pwd_status").checked;

	list_bs = cf.block.sites || [];
	list_bw = cf.block.words || [];
	list_ts = cf.trust.sites || [];
	list_pf = pf.words || [];

	var i = 0, l = Math.max(list_bw.length, list_pf.length, list_bs.length, list_ts.length);
	while (i < l) {
		var l1 = list_bw[i], l2 = list_pf[i], l3 = list_bs[i], l4 = list_ts[i];

		if (l1) {
			populateList('blocked_word', l1);
		}

		if (l2) {
			populateList('profanity_word', l2);
		}

		if (l3) {
			populateList('blocked_url', l3);
		}

		if (l4) {
			populateList('trusted_url', l4);
		}

		i++;
	};
};

var toogleList = function (e, id) {
	var el = Dom.get(id);
	if (el.style.display == 'block') {
		el.style.display = 'none';
		if (e) {
			e.childNodes[0].innerHTML = '&#9662;';
		}
	} else {
		el.style.display = 'block';
		if (e) {
			e.childNodes[0].innerHTML = '&#9652;';
		}
	}
}

var setPassword = function () {
	var pass1 = prompt("Insira sua senha", "");
	if (pass1 !== null && pass1.length > 0) {
		var pass2 = prompt("Por favor, confirme a senha", "");
		if (pass1 === pass2) {
			password = Crypto.SHA256(pass1);
			alert("Sucesso! Senha alterada. Salve as alterações ");
		} else {
			alert("As senhas são diferentes. Tente novamente.");
		}
	}
};

var genList = function () {
	var bg = chrome.extension.getBackgroundPage().tinyFilter_bg;
	bg.generateSubscription();
};

var reset_options = function () {
	var x = window.confirm("Tem certeza de que deseja redefinir as configurações?");
	if (x) {
		localStorage.removeItem('general_settings');
		localStorage.removeItem('content_filter');
		localStorage.removeItem('profanity_filter');
		localStorage.removeItem('subscriptions');
		chrome.extension.getBackgroundPage().tinyFilter_bg.init();
		window.location.reload();
	}
}
