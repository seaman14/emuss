// noinspection DuplicatedCode,JSDeprecatedSymbols

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery', 'router', 'toastr', 'optional!simplestorage', 'optional!moment-timezone', 'optional!ga', 'optional!octokat', 'optional!esheep', 'optional!clippy'], factory);
	} else { // noinspection DuplicatedCode
		if (typeof module === 'object' && module.exports) {
			module.exports = function(root, jQuery) {
				if (jQuery === undefined) {
					if (typeof window !== 'undefined') {
						// noinspection NpmUsedModulesInstalled
						jQuery = require('jquery');
					} else {
						// noinspection NpmUsedModulesInstalled
						jQuery = require('jquery')(root);
					}
				}
				factory(jQuery);
				return jQuery;
			};
		} else {
			factory(jQuery);
		}
	}
} (function ($, Router, toastr, simplestorage, moment, ga, Octokat, eSheep, clippy) {
	var root = location.hostname === 'localhost' ? 'https://emupedia.net' : '';
	var hash = location.hash.toString();
	var resizeTimeout = null;
	var versionCheckInterval = null;
	var $window = $(window);

	if (typeof $.fn.hasScrollBar === 'undefined') {
		$.fn.hasScrollBar = function() {
			var el = this.get(0);

			if (el) {
				return el.scrollHeight > this.height();
			}

			return false;
		}
	}

	$window.off('resize').on('resize', function() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function() {
			if ($('.desktop.emuos-desktop ').first().hasScrollBar()) {
				$('html').addClass('has-scrollbar');
			} else {
				$('html').removeClass('has-scrollbar');
			}
		}, 100);
	})

	$window.trigger('resize');

	toastr.target = '.emuos-taskbar-windows-containment';
	toastr.options.escapeHtml = true;
	toastr.options.closeButton = true;
	toastr.options.preventDuplicates = true;
	toastr.options.newestOnTop = true;
	toastr.options.timeOut = 0;
	toastr.options.extendedTimeOut = 0;
	toastr.options.showMethod = 'slideDown';

	// noinspection JSUnusedAssignment
	clearInterval(versionCheckInterval);
	// noinspection JSUnusedAssignment
	versionCheckInterval = setInterval(function() {
		$sys.api.fetch('https://api.github.com/repos/Emupedia/emupedia.github.io/commits/master', function(data) {
			try {
				// noinspection JSUnresolvedVariable
				data = JSON.parse(data.target.response);
			} catch(error) {
				console.log(error)
			}

			// noinspection JSUnresolvedVariable
			if (typeof data.sha !== 'undefined' && typeof $sys.version !== 'undefined') {
				// noinspection JSUnresolvedVariable
				if (data.sha !== null && $sys.version !== null) {
					// noinspection JSUnresolvedVariable
					if (data.sha !== '' && $sys.version !== '' && $sys.version !== '{{ site.github.build_revision }}') {
						// noinspection JSUnresolvedVariable
						if (data.sha !== $sys.version) {
							toastr.options.onclick = function() {
								location.reload();
							};
							toastr.info('New update available, click here to reload');
							toastr.options.onclick = function() {};
						}
					}
				}
			}
		});
	}, 5 * 60 * 1000);

	function copyToClipboard(text, el) {
		if ('clipboard' in navigator) {
			// noinspection JSIgnoredPromiseFromCall
			navigator.clipboard.writeText(text);
		} else {
			var element = document.createElement('input');

			element.type = 'text';
			element.disabled = true;

			element.style.setProperty('position', 'fixed');
			element.style.setProperty('z-index', '-100');
			element.style.setProperty('pointer-events', 'none');
			element.style.setProperty('opacity', '0');

			element.value = text;

			document.body.appendChild(element);

			element.click();
			element.select();
			document.execCommand('copy');

			document.body.removeChild(element);
		}

		if (el) {
			var message = $('<span>Copied to Clipboard!</span>')

			$(el).after(message)

			message.fadeOut(1000, function() {
				$(this).remove();
			});
		}
	}

	window.copyToClipboard = copyToClipboard;

	function getEaster(year) {

		year = parseInt(year);

		var f = Math.floor;
		var jDay = 0;
		var jMonth = 0;
		var oDay = 0;
		var oMonth = 0;
		var wDay = 0;
		var wMonth = 0;

		function EasterJulian() {
			// noinspection JSUnusedAssignment
			var g = 0;
			// noinspection JSUnusedAssignment
			var i = 0;
			// noinspection JSUnusedAssignment
			var j = 0;
			// noinspection JSUnusedAssignment
			var p = 0;

			g = year % 19;
			i = (19 * g + 15) % 30;
			j = (year + f(year / 4) + i) % 7;
			p = i - j;

			jMonth = 3 + f((p + 40) / 44);
			jDay = p + 28 - 31 * f(jMonth / 4);
		}

		function EasterGregorian() {
			// noinspection JSUnusedAssignment
			var g = 0;
			// noinspection JSUnusedAssignment
			var c = 0;
			// noinspection JSUnusedAssignment
			var h = 0;
			// noinspection JSUnusedAssignment
			var i = 0;
			// noinspection JSUnusedAssignment
			var j = 0;
			// noinspection JSUnusedAssignment
			var p = 0;

			g = year % 19;
			c = f(year / 100);
			h = (c - f(c / 4) - f(8 * c + 13 / 25) + 19 * g + 15) % 30;
			i = h - f(h / 28) * (1 - f(h / 28) * f(29 / h + 1) * f(21 - g / 11));
			j = (year + f(year / 4) + i + 2 - c + f(c / 4)) % 7;
			p = i - j;

			wMonth = 3 + f((p + 40) / 44);
			wDay = p + 28 - 31 * f(wMonth / 4);
		}

		function EasterOrthodox () {
			var extra = 0;
			var tmp = 0;

			oDay = 0;
			oMonth = 0;

			if ((year > 1582) && (year <= 4099)) {
				extra = 10;

				if (year > 1600) {
					tmp = f(year / 100) - 16;
					extra = extra + tmp - f(tmp / 4);
				}

				oDay = jDay + extra;
				oMonth = jMonth;

				if ((oMonth === 3) && (oDay > 31)) {
					oMonth = 4;
					oDay = oDay - 31;
				}

				if ((oMonth === 4) && (oDay > 30)) {
					oMonth = 5;
					oDay = oDay - 30;
				}
			}
		}

		EasterJulian()
		EasterGregorian()
		EasterOrthodox()

		return {
			julian: {
				month: jMonth || -1,
				day: jDay || -1
			},
			gregorian: {
				month: wMonth || -1,
				day: wDay || -1
			},
			orthodox: {
				month: oMonth || -1,
				day: oDay || -1
			}
		}
	}

	var EmuOS = function (options) {
		var self = this;

		// noinspection JSUnusedGlobalSymbols
		self.$document	= $(document);
		self.$window	= $(window);
		self.$html		= $('html');
		self.$body		= $('body');

		self.disclaimer = '<br /><br />Disclaimer<hr />This software does not represent in anyway the original product, it only represents an attempt to recreate the original look &amp; feel of the product using modern web technologies for educational and digital archiving purposes.<br /><br />If you own the copyrights to a title and would like to request removal please note that we process all correct and complete removal requests within 5 working days. You may send an email to dmca [at] emupedia.net for all DMCA Takedown notices / Removal Requests.<br /><br />The author(s) and/or any of it\'s maintainers are in no way associated with or endorsed by the copyright holders.';
		self.disclaimer_abandoned = '<br /><br />Disclaimer<hr />This software does not represent in anyway the original product, it only represents an attempt to recreate the original look &amp; feel of the product using modern web technologies for educational and digital archiving purposes, because the original product no longer works on modern computer hardware without modifications.<br /><br />Through the Library of Congress, some key <a target="_blank" href="https://www.copyright.gov/1201/docs/librarian_statement_01.html">exemptions</a> to the DMCA have been granted to allow for video game preservation.<br /><br />If you own the copyrights to a title and would like to request removal please note that we process all correct and complete removal requests within 5 working days. You may send an email to dmca [at] emupedia.net for all DMCA Takedown notices / Removal Requests.<br /><br />The author(s) and/or any of it\'s maintainers are in no way associated with or endorsed by the copyright holders.';

		self.options = $.extend(true, {}, options);

		// noinspection FallThroughInSwitchStatementJS
		switch (self.options.theme) {
			case 'theme-basic':
				break;
			case 'theme-windows-3':
				// noinspection JSJQueryEfficiency
				if (typeof $('.emuos-window .window.emuos-window-content').mCustomScrollbar === 'function') {
					$('.emuos-window .window.emuos-window-content').mCustomScrollbar({
						axis: 'y',
						scrollbarPosition: 'inside',
						scrollInertia: 0,
						alwaysShowScrollbar: 0,
						keyboard: {
							enable: true
						},
						scrollButtons: {
							enable: true
						},
						mouseWheel: {
							enable: true
						},
						advanced: {
							updateOnContentResize: true,
							updateOnImageLoad: true,
							updateOnSelectorChange: true
						},
						live: true
					});
				}
				break;
			case 'theme-windows-95':
			case 'theme-windows-98':
			case 'theme-windows-me':
				self.options.start = [{
					name: 'Windows Update'
				} , {
					name: 'Programs'
				} , {
					name: 'Documents'
				} , {
					name: 'Settings'
				} , {
					name: 'Search'
				} , {
					name: 'Help'
				} , {
					name: 'Run...'
				} , {
					name: 'Log Off...'
				} , {
					name: 'Shut Down...'
				}];
				break;
		}

		self.$html.removeClass('post boot');
		self.$body.find('.emuos-startup').first().remove();
		self.$body.find('.emuos-boot').first().remove();

		if ($sys.browser.isIE) {
			self.$html.addClass('browser-trident');
		} else if ($sys.browser.isEdgeHTML) {
			self.$html.addClass('browser-edgehtml');
		} else if ($sys.browser.isChrome || $sys.browser.isOperaBlink || $sys.browser.isEdgeBlink || $sys.browser.isChromium) {
			self.$html.addClass('browser-blink');
		} else if ($sys.browser.isSafari || $sys.browser.isOperaPresto) {
			self.$html.addClass('browser-webkit');
		} else if ($sys.browser.isFirefox || $sys.browser.isPaleMoon || $sys.browser.isKMeleon || $sys.browser.isNetscape) {
			self.$html.addClass('browser-gecko');
		} else {
			self.$html.addClass('browser-other');
		}

		var start = '';
		var domains = ['emupedia.net', 'emupedia.org', 'emupedia.games', 'emuos.net', 'emuos.org', 'emuos.games'];
		var frontend = ~domains.indexOf(window.location.hostname) ? 'https://emuchat.' + domains[domains.indexOf(window.location.hostname)] + '/' : 'https://emuchat.emupedia.net/';
		var chat = null;

		if (typeof self.options.start !== 'undefined') {
			start = '<ul data-menu-lang="*" data-menu-type="start">';

			for (var i in self.options.start) {
				// noinspection JSUnfilteredForInLoop
				start += '<li>' + self.options.start[i]['name'] + '</li>';
			}

			start += '</ul>';
		}

		self.$body.append('<div class="desktop" tabindex="0"></div><div class="taskbar">' + start + '</div>');

		self.$desktop = $('.desktop').first();
		self.$taskbar = $('.taskbar').first();

		for (var j in self.options.icons) {
			// noinspection JSUnfilteredForInLoop,JSDuplicatedDeclaration
			var icon_options = self.options.icons[j];

			if (typeof icon_options['requires'] === 'object') {
				var reqs = Object.keys(icon_options['requires']);

				for (var req in reqs) {
					// noinspection JSUnfilteredForInLoop
					var required = reqs[req].toUpperCase();

					if (typeof $sys.feature[required] !== 'undefined') {
						if ($sys.feature[required] === true) {
							// noinspection JSUnfilteredForInLoop
							$.extend(true, icon_options, icon_options['requires'][reqs[req]]);
						}
					}
				}
			}

			if (typeof icon_options['credits'] !== 'undefined') {
				if (typeof icon_options['link'] !== 'undefined') {
					var share_link = '';
					var copy_link = '';

					if (icon_options['share'] === true) {
						if (~icon_options['link'].indexOf('http')) {
							share_link = location.origin.toString() + location.pathname.toString() + '#/' + icon_options['link'];
							copy_link = '<button type="button" onclick="copyToClipboard(\'' + share_link + '\', this)" class="ui-button ui-button-icon-only ui-widget ui-corner-all" title="Copy to Clipboard"><span class="ui-button-icon ui-icon ui-icon-copy"></span></button>';
							icon_options['credits'] = 'Share Link: <a href="' + share_link + '" target="_blank">' + icon_options['link'] + '</a> ' + copy_link +  '<br /><br />' + icon_options['credits'];
						} else {
							share_link = location.origin.toString() + location.pathname.toString() + '#/' + icon_options['link'].slice(1, -1);
							copy_link = '<button type="button" onclick="copyToClipboard(\'' + share_link + '\', this)" class="ui-button ui-button-icon-only ui-widget ui-corner-all" title="Copy to Clipboard"><span class="ui-button-icon ui-icon ui-icon-copy"></span></button>';
							icon_options['credits'] = 'Share Link: <a href="' + share_link + '" target="_blank">' + icon_options['link'].slice(1, -1) + '</a> ' + copy_link +  '<br /><br />' + icon_options['credits'];
						}
					}
				}

				if (typeof icon_options['disclaimer_abandoned'] !== 'undefined') {
					if (icon_options['disclaimer_abandoned'] === true) {
						icon_options['credits'] += self.disclaimer_abandoned;
					}
				}

				if (typeof icon_options['disclaimer'] !== 'undefined') {
					if (icon_options['disclaimer'] === true) {
						icon_options['credits'] += self.disclaimer;
					}
				}
			}

			var href = typeof icon_options['target'] !== 'undefined' ? ' href="' + (icon_options['link'].indexOf('http') === 0 ? icon_options['link'] : root + icon_options['link']) + '" target="' + icon_options['target'] + '" ' : ' href="javascript:" ';
			var icon = typeof icon_options['icon'] !== 'undefined' ? (Array.isArray(icon_options['icon']) ? icon_options['icon'][Math.floor(Math.random() * icon_options['icon'].length)] : icon_options['icon']) : 'images/icons/desktop/joystick';

			// noinspection JSUnfilteredForInLoop
			var $icon = $('<a class="emuos-desktop-icon"'+ href + (icon_options['title'] ? 'data-title="' + icon_options['title'] + '"' : '') + '>' +
							'<i class="icon overlay ribbon' + (icon_options['shortcut'] ? ' shortcut' : '') + (icon_options['prototype'] ? ' prototype' : '') + (icon_options['beta'] ? ' beta' : '') + (icon_options['new'] ? ' new' : '') + '" style="background-image: url(' + icon  + ($sys.browser.isIE ? '.png' : '.ico') + ');"></i>' +
							'<span>' + icon_options['name'] + '</span>' +
						'</a>');

			// noinspection JSUnfilteredForInLoop
			$icon.data('name', icon_options['name']);

			// noinspection JSUnfilteredForInLoop
			$icon.data('icon', icon_options['icon']);

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['link'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.data('link', icon_options['link'].indexOf('http') === 0 ? icon_options['link'] : root + icon_options['link']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['target'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.data('target', icon_options['target']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['newtab'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.data('newtab', icon_options['newtab']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['credits'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.data('credits', icon_options['credits']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['width'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.data('width', icon_options['width']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['height'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.data('height', icon_options['height']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['top'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.data('top', icon_options['top']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['left'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.data('left', icon_options['left']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['right'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.data('right', icon_options['right']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['bottom'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.data('bottom', icon_options['bottom']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['widget'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.attr('data-widget', icon_options['widget'] ? 'true' : 'false').data('widget', icon_options['widget']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['autostart'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.attr('data-autostart', icon_options['autostart'] ? 'true' : 'false').data('autostart', icon_options['autostart']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['runonce'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.attr('data-runonce', icon_options['runonce'] ? 'true' : 'false').data('runonce', icon_options['runonce']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['singleinstance'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.attr('data-singleinstance', icon_options['singleinstance'] ? 'true' : 'false').data('singleinstance', icon_options['singleinstance']);
			}

			// noinspection JSUnfilteredForInLoop
			if (typeof icon_options['xmas'] !== 'undefined') {
				// noinspection JSUnfilteredForInLoop
				$icon.attr('data-xmas', icon_options['xmas'] ? 'true' : 'false').data('xmas', icon_options['xmas']);
			}

			if (typeof icon_options['xmas'] === 'undefined') {
				// noinspection JSUnfilteredForInLoop
				self.$desktop.append($icon);
			} else if (moment().month() + 1 === 12 && moment().date() >= 23 && moment().date() <= 25 && $icon.attr('data-xmas') === 'true') {
				self.$desktop.append($icon);
			}

			$icon.off('click').on('click', function(e) {
				if (typeof $(this).data('target') === 'undefined') {
					e.preventDefault();
				}
			}).off('dblclick').on('dblclick', function() {
				// noinspection JSUnfilteredForInLoop,JSReferencingMutableVariableFromClosure
				if (typeof $(this).data('link') !== 'undefined') {
					if ($(this).data('name') === 'EmuChat') {
						if (typeof $(this).data('singleinstance') !== 'undefined') {
							// noinspection DuplicatedCode
							if ($(this).data('singleinstance') && self.$body.find('[id="' + $(this).data('name') + '"]').length === 0) {
								// noinspection JSUnfilteredForInLoop,JSReferencingMutableVariableFromClosure
								self.iframe({
									title: $(this).data('name'),
									credits: $(this).data('credits'),
									icon: $(this).data('icon'),
									src: frontend,
									newtab: $(this).data('newtab'),
									width: $(this).data('width'),
									height: $(this).data('height')
								});
							}
						} else {
							// noinspection JSUnfilteredForInLoop,JSReferencingMutableVariableFromClosure
							self.iframe({
								title: $(this).data('name'),
								icon: $(this).data('icon'),
								src: frontend,
								newtab: $(this).data('newtab'),
								width: $(this).data('width'),
								height: $(this).data('height'),
								credits: $(this).data('credits')
							});
						}
					}

					if (typeof ga === 'function') {
						ga('send', {
							hitType: 'pageview',
							page: $(this).data('link'),
							title: window.location.href
						});
					}

					if (typeof $(this).data('singleinstance') !== 'undefined') {
						// noinspection DuplicatedCode
						if ($(this).data('singleinstance') && self.$body.find('[id^="' + $(this).data('name') + '"]').length === 0) {
							// noinspection JSUnfilteredForInLoop,JSReferencingMutableVariableFromClosure
							self.iframe({
								title: $(this).data('name'),
								credits: $(this).data('credits'),
								icon: $(this).data('icon'),
								src: $(this).data('link'),
								newtab: $(this).data('newtab'),
								width: $(this).data('width'),
								height: $(this).data('height')
							});
						}
					} else if ($(this).data('widget')) {
						// noinspection JSUnfilteredForInLoop,JSReferencingMutableVariableFromClosure,HtmlDeprecatedAttribute
						self.widget({
							title: $(this).data('name'),
							icon: $(this).data('icon'),
							content: '<iframe id="' + $(this).data('name') + '" width="100%" height="100%" src="' + $(this).data('link') + '" onload="this.focus();this.contentWindow.focus();" frameborder="0" referrerpolicy="same-origin" allowTransparency="true" allow="autoplay; fullscreen; accelerometer; gyroscope; geolocation; microphone; camera; midi; encrypted-media; clipboard-read; clipboard-write" sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation"></iframe>',
							width: $(this).data('width'),
							height: $(this).data('height'),
							top: $(this).data('top'),
							left: $(this).data('left'),
							right: $(this).data('right'),
							bottom: $(this).data('bottom')
						});
					} else {
						// noinspection JSUnfilteredForInLoop,JSReferencingMutableVariableFromClosure
						self.iframe({
							title: $(this).data('name'),
							icon: $(this).data('icon'),
							src: $(this).data('link'),
							newtab: $(this).data('newtab'),
							width: $(this).data('width'),
							height: $(this).data('height'),
							credits: $(this).data('credits')
						});
					}
				} else {
					switch ($(this).data('name')) {
						case 'eSheep':
							if (typeof eSheep !== 'undefined') {
								if (typeof eSheep.prototype.Start === 'function') {
									var pets = ['esheep64', 'green_sheep', 'neko', 'pingus', 'ssj-goku'];
									var pet = pets[~~(Math.random() * pets.length)];
									var path = root + '/emupedia-app-esheep/pets/' + pet + '/animations.xml';

									if (path) {
										new eSheep({
											allowPets: 'all',
											allowPopup: 'no'
										}).Start(path);
									}
								}
							}
							break;
						case 'Clippy':
							//Peedy is bugged
							var agents = ['Bonzi', 'Clippy', 'F1', 'Genie', 'Genius', 'Links', 'Merlin', 'Rocky', 'Rover'];

							var phrases = [
								'How can i help you?',
								'Nice day!',
								'Glad to meet you.',
								'At your service',
								'Hello'
							];

							var agentName = agents[~~(Math.random() * agents.length)];

							if (!agentName) break;

							if (typeof clippy !== 'undefined') {
								if (typeof  clippy.load === 'function') {
									clippy.load(agentName, function(agent) {
										window[agentName] = agent;

										var randPos = function () {
											return .2 + Math.random() * .6;
										};

										var move = function() {
											agent.moveTo($(document).width() * randPos(), $(document).height() * randPos());
										};

										move();

										agent.show();

										// Speak on click and start
										var speak = function() {
											agent.speak('I am ' + agentName + ', ' + phrases[~~(Math.random() * phrases.length)]);
											agent.animate();
										};

										$(agent._el).click(function() {
											speak();
										});

										speak();

										// Animate randomly
										setInterval(function() {
											agent.animate();
										}, 3000 + (Math.random() * 4000));

										// Move randomly
										/*setInterval(function() {
											move();
										}, 3000 + (Math.random() * 4000));*/
									}, undefined, root + '/emupedia-app-clippy/agents/');
								}
							}
							break;
						case 'Webamp Classic':
							// noinspection JSUnresolvedFunction,JSUnresolvedVariable
							var webamp_content = self.options.apps.webamp.render();

							// noinspection JSUnfilteredForInLoop,JSReferencingMutableVariableFromClosure
							self.widget({
								title: $(this).data('name'),
								icon :$(this).data('icon'),
								content: webamp_content
							});

							// noinspection JSUnresolvedFunction,JSUnresolvedVariable
							self.options.apps.webamp.events('.emuos-taskbar-windows-containment');
							break;
						default:
					}
				}
			});
		}

		// noinspection JSUnresolvedFunction
		self.$taskbar.taskbar({
			//windowsContainment: 'viewport',
			windowsContainment: 'visible',
			horizontalStick: 'bottom left',
			horizontalWidth: '100%',
			draggable: true,
			resizable: true,
			resizableHandleOffset: 1,
			// draggableBetweenEdges: true,
			// buttonsTooltips: true,
			// propagateWindowBlur: true,
			// startButtons: true,
			menuAutoOpenOnBrowse: false,
			minimizeAll: true,
			languageSelect: false,
			toggleFullscreen: true,
			networkMonitor: true,
			clock: true,
			buttons: {
				chat: {
					label: 'Chat',
					text: false,
					icons: {
						primary: 'ui-icon-comment'
					}
				}
			},
			systemButtonsOrder: [
				'chat',
				'languageSelect',
				'networkMonitor',
				'toggleFullscreen',
				'clock',
				'minimizeAll'
			]
		});

		// noinspection JSUnresolvedFunction
		self.$desktop.desktop({
			iconClass: '.icon',
			parent: '.emuos-taskbar-windows-containment'
		});

		if (typeof moment === 'function') {
			if (moment().month() + 1 === 2 && moment().date() === 14) {
				self.$html.addClass('emuos-valentines');
			}

			if (moment().month() + 1 === 4 && moment().date() === 1) {
				self.$html.addClass('emuos-april1st');

				self.iframe({
					title: 'FBI FBI FBI THIS WEBSITE HAS BEEN SIZED FBI FBI FBI',
					icon: 'test',
					src: 'april1st.html',
					width: 1000,
					height: 700
				});
			}

			if ((moment().month() + 1 === getEaster(moment().year()).gregorian.month && moment().date() === getEaster(moment().year()).gregorian.day) || (moment().month() + 1 === getEaster(moment().year()).orthodox.month && moment().date() === getEaster(moment().year()).orthodox.day)) {
				self.$html.addClass('emuos-easter');
			}

			if (moment().month() + 1 === 10 && moment().date() >= 29) {
				self.$html.addClass('emuos-halloween');
			}

			if (moment().month() + 1 === 12) {
				var xmas = '';
				var newyear = '';

				if (moment().date() >= 23 && moment().date() <= 25) {
					xmas 	=	'<div class="xmas-countdown">' +
									'<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 100 100" xml:space="preserve" width="130px" height="130px">' +
										'<path class="bow-shadow" d="M58.8,26.6c0,0.6,0,1.3-0.2,1.9c-0.2,0.5,0,0.6,0.4,0.6c3.5-0.5,7,0.1,10.5-0.4\n' +
										'c0.3,0,0.6,0,0.9,0c2.7-0.1,5.5,0,8.2-0.2c3.8-0.3,7.7-0.5,11.4-1.4c1.2-0.3,2.2-1,3.2-1.6c0,0.3,0,0.6,0,0.9c0,2.6-0.4,3.3-2.9,3.9\n' +
										'c-3,0.8-6,1-9,1.2c-5.5,0.3-11,0.6-16.5,0.6c-0.2,0-0.3,0-0.4,0.2c-0.3-0.1-0.6-0.2-0.9-0.2c-1.2,0.4-2.5,0.1-3.7,0.1\n' +
										'c-0.6-0.2-1.2-0.2-1.8,0c-0.7,0-1.4,0-2.1,0c-4.2,0-8.4,0-12.6,0c-0.7,0-1.4,0-2.1,0c-0.6-0.2-1.2-0.2-1.8,0c-1.6,0-3.2,0-4.9,0\n' +
										'c-0.1-0.3-0.4-0.2-0.6-0.2c-5.6,0-11.1-0.3-16.6-0.6c-2.8-0.2-5.7-0.5-8.5-1.2c-0.4-0.1-0.9-0.3-1.3-0.4c-1.3-0.6-1.7-1.2-1.7-2.7\n' +
										'c0-0.6,0-1.1,0-1.7c2.4,2.1,5.4,2.1,8.3,2.4c3.2,0.4,6.4,0.5,9.6,0.7c4.5,0.2,9,0.4,13.5,0.4c0.9,0,1.7,0,2.6,0.2\n' +
										'c0.5,0.1,0.8-0.1,0.5-0.7c-0.3-0.6-0.2-1.2-0.2-1.8c0.2-1-0.2-1.4-1.1-1.7c-2.2-0.6-4.2-1.7-6.1-3c-3.1-2.2-5.7-4.9-8.4-7.5\n' +
										'c-1.4-1.4-2.5-1.2-3.6,0.5c-0.8,1.3-1.1,2.8-1.5,4.3c-0.3-1.1-0.2-2.3,0-3.4c0.4-1.7,0.8-3.5,2-4.9c0.9-1.1,1.8-1.1,2.7-0.1\n' +
										'c1.5,1.6,3.1,3.2,4.5,4.9c2.8,3.4,6.2,6,10.2,7.7c0.8,0.3,1.3,0.6,1.4,1.6c0.5,2.5,2.7,4.3,5.2,4.1c2.6-0.2,5.2-0.1,7.8,0\n' +
										'c2.8,0.2,4.9-1.7,5.4-4.4c0.1-0.6,0.4-0.9,0.9-1.1c3.9-1.6,7.3-4,10.2-7.2c1.6-1.8,3.1-3.7,4.8-5.4c1.1-1.1,2.1-1.2,2.9,0.1\n' +
										'c1.7,2.4,2.4,5.1,2,8.1c-0.4-1.5-0.7-3-1.5-4.3c-1-1.7-2.2-1.8-3.6-0.5c-1.3,1.3-2.7,2.7-4,4C67.4,21.2,64,23.8,60,25\n' +
										'C59,25.2,58.6,25.6,58.8,26.6z M41.1,32.3c-0.6-0.2-1.2-0.2-1.8,0c0.1,0,0.1,0,0.2,0.1C40,32.3,40.5,32.3,41.1,32.3z M57.8,32.3\n' +
										'c0.5,0,1,0,1.6,0.1c0.1,0,0.1,0,0.2-0.1C59,32,58.4,32,57.8,32.3z" />' +
										'<path class="bow" d="M5.7,26.5c0.2-3.9,0.8-7.8,2.3-11.4c2.9-6.9,7.7-11.6,14.7-13.7c0.9-0.3,1.8-0.4,2.8-0.3\n' +
										'c1.9,0.2,3.2,1.4,4,3.1c1.2,2.5,1.9,5.3,3.1,7.8c1.7,3.7,4.2,6.8,7.5,9.2c0.3-0.7,0.5-1.3,0.8-1.9c1-1.4,2.3-2.2,4-2.2\n' +
										'c2.9,0,5.9,0,8.8,0c2.3,0,3.9,1.2,4.7,3.4c0.1,0.2,0.2,0.4,0.3,0.7c3.3-2.4,5.8-5.5,7.5-9.2c0.9-2,1.6-4.1,2.4-6.2\n' +
										'c0.1-0.4,0.3-0.8,0.4-1.1c1.5-3.4,3.6-4.4,7.1-3.4c5.9,1.7,10.3,5.5,13.3,10.9c2.2,4,3.3,8.4,3.5,13c0,0.4,0.1,0.8,0.1,1.2\n' +
										'c-1,0.7-1.9,1.4-3.2,1.6c-3.8,0.9-7.6,1-11.4,1.4c-2.7,0.2-5.4,0.2-8.2,0.2c-0.3,0-0.6,0-0.9,0c-3.5,0.5-7-0.1-10.5,0.4\n' +
										'c-0.4,0.1-0.7-0.3-0.5-0.8c0.3-0.6,0.3-1,0.4-1.6c4.6-0.6,9.2-0.9,13.8-1.6c2-0.3,3.9-0.6,5.7-1.5c0.9-0.4,1.5-1.1,1.3-2.2\n' +
										'c-0.1-0.7-0.1-1.5-0.2-2.2c0.5-3-0.3-5.7-2-8.1c-0.9-1.3-1.8-1.2-2.9-0.1c-1.7,1.7-3.2,3.6-4.8,5.4c-2.8,3.2-6.2,5.7-10.2,7.2\n' +
										'c-0.5,0.2-0.8,0.5-0.9,1.1c-0.6,2.7-2.6,4.6-5.4,4.4c-2.6-0.1-5.2-0.1-7.8,0c-2.6,0.2-4.8-1.7-5.2-4.1c-0.2-0.9-0.7-1.3-1.4-1.6\n' +
										'c-4-1.7-7.4-4.2-10.2-7.7c-1.4-1.7-3-3.3-4.5-4.9c-1-1-1.8-0.9-2.7,0.1c-1.2,1.4-1.6,3.1-2,4.9c-0.2,1.1-0.4,2.2,0,3.4\n' +
										'c0,0.3-0.1,0.7-0.1,1c-0.3,2.5,0.1,3.1,2.4,3.8c1.1,0.4,2.3,0.6,3.5,0.8c5,0.9,10,1.1,15,1.8c0,0.6,0.2,1.2,0.4,1.7\n' +
										'c0.3,0.6-0.2,0.8-0.7,0.7c-0.9-0.1-1.7-0.2-2.6-0.2c-4.5,0-9-0.2-13.5-0.4c-3.2-0.1-6.4-0.3-9.6-0.7C11.2,28.5,8.2,28.5,5.7,26.5z" />' +
									'</svg>' +
									'<div class="message"></div>' +
									'<div class="countdown"></div>' +
								'</div>';
				}

				xmas +=		'<div class="xmas-snow" aria-hidden="true">' +
								'<div class="snowflakes"><div class="snowflake">❅</div></div>' +
								'<div class="snowflakes"><div class="snowflake">❆</div></div>' +
								'<div class="snowflakes"><div class="snowflake">❅</div></div>' +
								'<div class="snowflakes"><div class="snowflake">❆</div></div>' +
								'<div class="snowflakes"><div class="snowflake">❅</div></div>' +
								'<div class="snowflakes"><div class="snowflake">❆</div></div>' +
								'<div class="snowflakes"><div class="snowflake">❅</div></div>' +
								'<div class="snowflakes"><div class="snowflake">❆</div></div>' +
								'<div class="snowflakes"><div class="snowflake">❅</div></div>' +
								'<div class="snowflakes"><div class="snowflake">❆</div></div>';

				if (moment().date() >= 23 && moment().date() <= 25) {
					xmas +=		'<div class="snowflakes"><div class="snowflake">🎄</div></div>' +
								'<div class="snowflakes"><div class="snowflake">🎅</div></div>' +
								'<div class="snowflakes"><div class="snowflake">🎄</div></div>' +
								'<div class="snowflakes"><div class="snowflake">🎁</div></div>' +
								'<div class="snowflakes"><div class="snowflake">⛄</div></div>' +
								'<div class="snowflakes"><div class="snowflake">🎁</div></div>' +
								'<div class="snowflakes"><div class="snowflake">🎅</div></div>' +
								'<div class="snowflakes"><div class="snowflake">🎁</div></div>' +
								'<div class="snowflakes"><div class="snowflake">⛄</div></div>';
				}

				xmas +=		'</div>';

				self.$desktop.prepend(xmas);

				if (moment().date() >= 23 && moment().date() <= 25) {
					var currentYear = new Date().getFullYear();

					var getRemaining = function(dt, id, timer) {
						var end = new Date(dt);
						var now = new Date();

						var distance = end - now;
						var daysTil = Math.ceil(distance / timer().day);
						var message = $('.xmas-countdown .message').get(0);

						$('.xmas-countdown .' + id).get(0).innerHTML = daysTil + '';

						distance !== 0 ? message.innerHTML = 'Days \'til Xmas' : message.innerHTML = 'Merry Xmas!';
					};

					var timer = function() {
						return {
							second: 1000,
							get minute() { return this.second * 60 },
							get hour() { return this.minute * 60 },
							get day() { return this.hour * 24}
						}
					};

					getRemaining('12/25/' + currentYear, 'countdown', timer);
				}

				if (moment().date() >= 26) {
					newyear += '<div class="newyear-countdown">' +
									'<div class="newyear-box">' +
										'<div id="days" class="num">00</div>' +
										'<div id="days-text" class="text">Days</div>' +
									'</div>' +
									'<div class="newyear-box">' +
										'<div id="hours" class="num">00</div>' +
										'<div id="hours-text" class="text">Hours</div>' +
									'</div>' +
									'<div class="newyear-box">' +
										'<div id="mins" class="num">00</div>' +
										'<div id="mins-text" class="text">Minutes</div>' +
									'</div>' +
									'<div class="newyear-box">' +
										'<div id="secs" class="num">00</div>' +
										'<div id="secs-text" class="text">Seconds</div>' +
									'</div>' +
								'</div>';
				}

				if (moment().date() === 31) {
					newyear +=	'<div class="fireworks">' +
									'<div class="fireworks-before"></div>' +
									'<div class="fireworks-after"></div>' +
								'</div>';
				}

				self.$desktop.prepend(newyear);

				if (moment().date() >= 26) {
					function timeLeft(endtime) {
						// noinspection JSCheckFunctionSignatures
						var t = Date.parse(endtime) - Date.parse(new Date());
						var seconds = Math.floor( (t / 1000) % 60 );
						var minutes = Math.floor( (t / 1000 / 60) % 60 );
						var hours = Math.floor( (t / (1000 * 60 * 60)) % 24 );
						var days = Math.floor( t / (1000 *60 * 60* 24) );

						return {
							total: t,
							days: days,
							hours: hours,
							minutes: minutes,
							seconds: seconds
						};
					}

					function setClock(newyear) {
						var timeinterval = setInterval(function() {
							var t = timeLeft(newyear);

							// noinspection JSJQueryEfficiency
							$('#days').text(t.days);
							// noinspection JSJQueryEfficiency
							$('#hours').text(t.hours);
							// noinspection JSJQueryEfficiency
							$('#mins').text(('0' + t.minutes).slice(-2));
							// noinspection JSJQueryEfficiency
							$('#secs').text(('0' + t.seconds).slice(-2));

							if (t.total <= 0) {
								clearInterval(timeinterval);

								var now = new Date();
								var yearStr = now.getFullYear().toString();

								$('#days').text(yearStr[0]);
								$('#days-text').text('Happy');
								$('#hours').text(yearStr[1]);
								$('#hours-text').text('New');
								$('#mins').text(yearStr[2]);
								$('#mins-text').text('Year');
								$('#secs').text(yearStr[3]);
								$('#secs-text').text('!!!');
							}
						},1000);
					}

					var today = new Date();
					var deadline = 'January 1 ' + (today.getFullYear() + 1) + ' 00:00:00';

					if (today.getMonth() === 0 && today.getDate() === 1) {
						deadline = 'January 1 ' + (today.getFullYear()) + ' 00:00:00';
					}

					setClock(deadline);
				}
			}
		}

		self.$desktop.find('[data-autostart="true"]').trigger('dblclick');

		self.$desktop.find('[data-runonce="true"]').each(function() {
			if (typeof simplestorage !== 'undefined') {
				if (typeof simplestorage.get === 'function') {
					if (typeof simplestorage.get($(this).data('name')) === 'undefined') {
						if (typeof simplestorage.set === 'function') {
							simplestorage.set($(this).data('name'), true);
							$(this).trigger('dblclick');
						}
					}
				}
			}
		});

		if (typeof self.options.network !== 'undefined') {
			if (typeof self.options.network.start === 'function') {
				setTimeout(function() {
					window['NETWORK_CONNECTION'] = self.options.network.start({
						servers: ['wss://ws.emupedia.net/ws/', 'wss://ws.emupedia.org/ws/', 'wss://ws.emupedia.games/ws/', 'wss://ws.emuos.net/ws/', 'wss://ws.emuos.org/ws/', 'wss://ws.emuos.games/ws/'],
						server: ~window.location.hostname.indexOf('emupedia.net') ? 0 : (~window.location.hostname.indexOf('emupedia.org') ? 1 : (~window.location.hostname.indexOf('emupedia.games') ? 2 : (~window.location.hostname.indexOf('emuos.net') ? 3 : (~window.location.hostname.indexOf('emuos.org') ? 4 : (~window.location.hostname.indexOf('emuos.games') ? 5 : 0))))),
						mode: 0
					});
				});
			}
		}

		self.$window.one('keydown', function (e) {
			// noinspection JSRedundantSwitchStatement
			switch (e.keyCode) {
				case 192:
					if (!chat) {
						// noinspection HtmlDeprecatedAttribute,HtmlUnknownTarget
						chat = self.widget({
							title: 'Chat',
							hidden: true,
							width: 640,
							height: 350,
							right: '0px',
							bottom: '28px',
							content: '<iframe id="Chat" width="100%" height="100%" src="' + frontend + '" frameborder="0" allowTransparency="true" allow="autoplay; fullscreen; accelerometer; gyroscope; geolocation; microphone; camera; midi; encrypted-media; clipboard-read; clipboard-write" sandbox="allow-forms allow-downloads allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation"></iframe>'
						});

						chat.find('iframe').one('load', function() {
							chat.slideDown(300);
						});

						e.preventDefault();
						return false;
					}
			}
		});

		self.$taskbar.taskbar('option', 'buttons.chat').$element.one('click', function() {
			if (!chat) {
				// noinspection HtmlDeprecatedAttribute,HtmlUnknownTarget
				chat = self.widget({
					title: 'Chat',
					hidden: true,
					width: 640,
					height: 350,
					right: '0px',
					bottom: '28px',
					content: '<iframe id="Chat" width="100%" height="100%" src="' + frontend + '" frameborder="0" allowTransparency="true" allow="autoplay; fullscreen; accelerometer; gyroscope; geolocation; microphone; camera; midi; encrypted-media; clipboard-read; clipboard-write" sandbox="allow-forms allow-downloads allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation"></iframe>'
				});

				chat.find('iframe').one('load', function() {
					chat.slideDown(300);
				});
			}
		});

		self.$html.contextmenu({
			delegate: '.emuos-desktop, .emuos-taskbar',
			menu: [{
				title: 'Refresh',
				cmd: 'refresh',
				uiIcon: 'ui-icon-refresh'
			} , {
				title: '----'
			} , {
				title: 'Themes',
				children: [{
					title: 'Basic',
					cmd: 'basic'
				} , {
					title: 'Windows 3.1',
					cmd: 'windows-3'
				} , {
					title: 'Windows 95',
					cmd: 'windows-95'
				} , {
					title: 'Windows 98',
					cmd: 'windows-98'
				} , {
					title: 'Windows ME',
					cmd: 'windows-me'
				}]
			}],
			select: function(e, ui) {
				switch (ui.cmd) {
					case 'refresh':
						// noinspection JSUnresolvedFunction
						window.location.reload();
						break;
					case 'basic':
						self.$html.removeClass('theme-windows-3 theme-windows-95 theme-windows-98 theme-windows-me').addClass('theme-basic');

						// noinspection JSJQueryEfficiency
						if (typeof $('.emuos-window .window.emuos-window-content').mCustomScrollbar === 'function') {
							// noinspection JSJQueryEfficiency
							$('.emuos-window .window.emuos-window-content').mCustomScrollbar('destroy');
						}
						self.$taskbar.taskbar('option', 'resizableHandleOffset', 0).taskbar('instance')._refresh();
						break;
					case 'windows-3':
						self.$html.removeClass('theme-basic theme-windows-95 theme-windows-98 theme-windows-me').addClass('theme-windows-3');
						// noinspection JSJQueryEfficiency
						if (typeof $('.emuos-window .window.emuos-window-content').mCustomScrollbar === 'function') {
							// noinspection JSJQueryEfficiency
							$('.emuos-window .window.emuos-window-content').mCustomScrollbar('destroy');
							// noinspection JSJQueryEfficiency
							$('.emuos-window .window.emuos-window-content').mCustomScrollbar({
								axis: 'y',
								scrollbarPosition: 'inside',
								scrollInertia: 0,
								alwaysShowScrollbar: 0,
								keyboard: {
									enable: true
								},
								scrollButtons: {
									enable: true
								},
								mouseWheel: {
									enable: true
								},
								advanced: {
									updateOnContentResize: true,
									updateOnImageLoad: true,
									updateOnSelectorChange: true
								},
								live: true
							});
						}
						self.$taskbar.taskbar('option', 'resizableHandleOffset', 0).taskbar('instance')._refresh();
						break;
					case 'windows-95':
						self.$html.removeClass('theme-basic theme-windows-3 theme-windows-98 theme-windows-me').addClass('theme-windows-95');
						// noinspection JSJQueryEfficiency
						if (typeof $('.emuos-window .window.emuos-window-content').mCustomScrollbar === 'function') {
							$('.emuos-window .window.emuos-window-content').mCustomScrollbar('destroy');
						}
						self.$taskbar.taskbar('option', 'resizableHandleOffset', 1).taskbar('instance')._refresh();
						break;
					case 'windows-98':
						self.$html.removeClass('theme-basic theme-windows-3 theme-windows-95 theme-windows-me').addClass('theme-windows-98');
						// noinspection JSJQueryEfficiency
						if (typeof $('.emuos-window .window.emuos-window-content').mCustomScrollbar === 'function') {
							$('.emuos-window .window.emuos-window-content').mCustomScrollbar('destroy');
						}
						self.$taskbar.taskbar('option', 'resizableHandleOffset', 1).taskbar('instance')._refresh();
						break;
					case 'windows-me':
						self.$html.removeClass('theme-basic theme-windows-3 theme-windows-95 theme-windows-98').addClass('theme-windows-me');
						// noinspection JSJQueryEfficiency
						if (typeof $('.emuos-window .window.emuos-window-content').mCustomScrollbar === 'function') {
							$('.emuos-window .window.emuos-window-content').mCustomScrollbar('destroy');
						}
						self.$taskbar.taskbar('option', 'resizableHandleOffset', 1).taskbar('instance')._refresh();
						break;
				}

				if (typeof simplestorage !== 'undefined') {
					if (typeof simplestorage.set === 'function') {
						if (ui.cmd !== 'refresh') {
							simplestorage.set('theme', ui.cmd);
						}
					}
				}

				return true;
			}
		});

		self.$html.on('mousemove', function (e) {
			var parentOffset = $(e.target).offset();
			var relX = e.pageX - parentOffset.left;
			var relY = e.pageY - parentOffset.top;
			self.$html.get(0).style.setProperty('--mouse-x', relX + 'px');
			self.$html.get(0).style.setProperty('--mouse-y', relY + 'px');
		});

		Router.config({mode: 'hash', root: root});
		// noinspection JSIgnoredPromiseFromCall
		Router.navigate('/');

		Router.add(/(.*)/, function(route) {
			var params = '';

			if (~route.indexOf('?')) {
				params = route.slice(route.lastIndexOf('?') + 1);
				route = route.slice(0, route.lastIndexOf('?'));
			}

			for (var j in self.options.icons) {
				// noinspection JSUnfilteredForInLoop,JSDuplicatedDeclaration
				var icon_options = self.options.icons[j];

				if (typeof icon_options['link'] !== 'undefined') {
					var icon_link = '';

					if (!~icon_options['link'].indexOf('http')) {
						icon_link = ~icon_options['link'].indexOf('?') ? icon_options['link'].slice(0, icon_options['link'].indexOf('?')) : icon_options['link'];
						icon_link = icon_link.substr(0, 1) === '/' ? icon_link.slice(1) : icon_link;
						icon_link = ~icon_link.lastIndexOf('/') ? icon_link.slice(0, icon_link.lastIndexOf('/')) : icon_link;

						if (route === icon_link) {
							if (params !== '') {
								var $icon = self.$desktop.find('a.emuos-desktop-icon span:contains("' + icon_options['name'] + '")').first().parent();
								$icon.data('link', $icon.data('link').indexOf('?') ? $icon.data('link').slice(0, $icon.data('link').indexOf('?')) + '?' + params : $icon.data('link') + '?' + params);
								$icon.trigger('dblclick');
								break;
							}

							self.$desktop.find('a.emuos-desktop-icon span:contains("' + icon_options['name'] + '")').first().trigger('dblclick');
							break;
						}
					} else {
						icon_link = icon_options['link'].substr(-1) === '/' ? icon_options['link'].slice(0, -1) : icon_options['link'];

						if (route === icon_link) {
							self.$desktop.find('a.emuos-desktop-icon span:contains("' + icon_options['name'] + '")').first().trigger('dblclick');
							break;
						}
					}
				}
			}
		}).listen();

		if (hash.indexOf('#') === 0) {
			hash = hash.slice(1);

			if (hash !== '') {
				// noinspection JSIgnoredPromiseFromCall
				Router.navigate(hash);
			}
		}
	};

	// noinspection DuplicatedCode
	EmuOS.prototype.widget = function (options) {
		var self = this;

		var title		= typeof options.title		!== 'undefined'	? options.title		: '';
		var content		= typeof options.content	!== 'undefined'	? options.content	: '';
		var hidden		= typeof options.hidden		!== 'undefined' ? options.hidden	: false;
		var width		= typeof options.width		!== 'undefined' ? options.width		: 640;
		var height		= typeof options.height		!== 'undefined' ? options.height	: 400;
		var top			= typeof options.top		!== 'undefined' ? options.top		: null;
		var left		= typeof options.left		!== 'undefined' ? options.left		: null;
		var right		= typeof options.right		!== 'undefined' ? options.right		: null;
		var bottom		= typeof options.bottom		!== 'undefined' ? options.bottom	: null;
		var position	= (top !== null ? 'top: ' + top + '; ' : '') + (left !== null ? 'left: ' + left + '; ' : '') + (right !== null ? 'right: ' + right + '; ' : '') + (bottom !== null ? 'bottom: ' + bottom + '; ' : '');

		var widget = $('<div class="emuos-widget" style="display: ' + (hidden ? 'none' : 'block') +  '; position: absolute; ' + position + ' width: ' + width + 'px; height: ' + height + 'px; z-index: 9999;">' + content + '</div>');

		self.$body.append(widget);
		self.$taskbar = $('.taskbar').first();

		widget.find('iframe').off('load').on('load', function() {
			if (title === 'Chat') {
				var net = {};

				net.badge = 0;

				net.show = function() {
					if (typeof window['NETWORK_CONNECTION'] !== 'undefined') {
						if (typeof window['NETWORK_CONNECTION']['socket'] !== 'undefined') {
							// noinspection JSUnresolvedVariable
							if (typeof window['NETWORK_CONNECTION']['socket']['emit_event'] === 'function') {
								// noinspection JSUnresolvedFunction
								window['NETWORK_CONNECTION']['socket']['emit_event']('chat.show', {});
							}
						}
					}

					widget.slideDown(300);
					net.badge = 0;
					var $icon = self.$body.find('.emuos-desktop-icon span:contains("EmuChat")').siblings('i.icon').first();
					$icon.attr('class', 'icon badge');
				};

				net.hide = function() {
					if (typeof window['NETWORK_CONNECTION'] !== 'undefined') {
						if (typeof window['NETWORK_CONNECTION']['socket'] !== 'undefined') {
							// noinspection JSUnresolvedVariable
							if (typeof window['NETWORK_CONNECTION']['socket']['emit_event'] === 'function') {
								// noinspection JSUnresolvedFunction
								window['NETWORK_CONNECTION']['socket']['emit_event']('chat.hide', {});
							}
						}
					}

					widget.slideUp(300);
				};

				net.toggle = function() {
					if (widget.is(':hidden')) {
						net.badge = 0;
						var $icon = self.$body.find('.emuos-desktop-icon span:contains("EmuChat")').siblings('i.icon').first();
						$icon.attr('class', 'icon badge');

						if (typeof window['NETWORK_CONNECTION'] !== 'undefined') {
							if (typeof window['NETWORK_CONNECTION']['socket'] !== 'undefined') {
								// noinspection JSUnresolvedVariable
								if (typeof window['NETWORK_CONNECTION']['socket']['emit_event'] === 'function') {
									// noinspection JSUnresolvedFunction
									window['NETWORK_CONNECTION']['socket']['emit_event']('chat.show', {});
								}
							}
						}
					} else {
						if (typeof window['NETWORK_CONNECTION'] !== 'undefined') {
							if (typeof window['NETWORK_CONNECTION']['socket'] !== 'undefined') {
								// noinspection JSUnresolvedVariable
								if (typeof window['NETWORK_CONNECTION']['socket']['emit_event'] === 'function') {
									// noinspection JSUnresolvedFunction
									window['NETWORK_CONNECTION']['socket']['emit_event']('chat.hide', {});
								}
							}
						}
					}

					widget.slideToggle(300);
				};

				self.$taskbar.taskbar('option', 'buttons.chat').$element.off('click').on('click', function() {
					net.toggle();
				});

				self.$window.off('keydown').on('keydown', function (e) {
					// noinspection JSRedundantSwitchStatement
					switch (e.keyCode) {
						case 192:
							net.toggle();
							e.preventDefault();
							return false;
					}
				});

				var $icon = self.$body.find('.emuos-desktop-icon span:contains("EmuChat")').siblings('i.icon').first();
				$icon.attr('class', 'icon badge');

				if (typeof window['NETWORK_CONNECTION'] !== 'undefined') {
					// noinspection JSUnresolvedVariable
					if (typeof window['NETWORK_CONNECTION'].register_iframe === 'function') {
						// noinspection JSUnresolvedVariable,JSUnresolvedFunction
						window['NETWORK_CONNECTION'].register_iframe(title);
					}
				}
			}
		});

		return widget;
	};

	// noinspection DuplicatedCode
	EmuOS.prototype.window = function (options) {
		var self = this;

		var title	= typeof options.title		!== 'undefined'	? options.title		: '';
		var icon	= typeof options.icon		!== 'undefined'	? options.icon		: '';
		var content	= typeof options.content	!== 'undefined'	? options.content	: '';

		var win	= $('<div class="window" data-title="'+ title +'">' + content + '</div>');

		self.$body.append(win);

		// noinspection JSValidateTypes
		win.window({
			icons: {
				main: this.$html.hasClass('theme-basic') || this.$html.hasClass('theme-windows-95') || this.$html.hasClass('theme-windows-98') || this.$html.hasClass('theme-windows-me') ? (icon !== '' ? icon + ($sys.browser.isIE ? '.png' : '.ico') : null) : ''
			}
		});

		// noinspection DuplicatedCode
		$('.emuos-window').contextmenu({
			autoTrigger: false,
			delegate: '.emuos-window-icon',
			menu: [{
				title: 'Restore',
				cmd: 'restore',
				disabled: true
			} , {
				title: 'Move',
				cmd: 'move'
			} , {
				title: 'Size',
				cmd: 'size'
			} , {
				title: 'Minimize',
				cmd: 'minimize'
			} , {
				title: 'Maximize',
				cmd: 'maximize'
			} , {
				title: '----'
			} , {
				title: 'Close',
				cmd: 'close'
			} , {
				title: '----'
			} , {
				title: 'Next',
				cmd: 'next'
			}],
			select: function(e, ui) {
				// noinspection JSRedundantSwitchStatement
				switch (ui.cmd) {
					case 'close':
						// noinspection JSValidateTypes,JSUnresolvedFunction
						$(e.target).children('.window, .iframe').first().window('close');
						break;
				}

				return true;
			},
			close: function (e) {
				console.log(e);
			}
		});

		$('.emuos-window-icon').on('click', function(e) {
			// noinspection JSUnresolvedFunction
			$(this).parents('.emuos-window').first().contextmenu('open', $(this));
			e.preventDefault();
		});

		// noinspection JSValidateTypes
		return win.window('instance');
	};

	// noinspection DuplicatedCode
	EmuOS.prototype.iframe = function (options) {
		var self = this;

		var title		= typeof options.title		!== 'undefined' ? options.title		: '';
		var icon		= typeof options.icon		!== 'undefined' ? options.icon		: '';
		var src			= typeof options.src		!== 'undefined' ? options.src		: '';
		var width		= typeof options.width		!== 'undefined' ? options.width		: 640;
		var height		= typeof options.height		!== 'undefined' ? options.height	: 400;
		var credits		= typeof options.credits	!== 'undefined' ? options.credits	: '';
		var newtab		= typeof options.newtab		!== 'undefined';

		// noinspection HtmlDeprecatedAttribute,JSUnresolvedVariable,JSUnresolvedFunction
		var win = $('<div class="iframe" data-title="'+ title +'"><iframe id="' + title + '" src="' + src + '" onload="this.focus();this.contentWindow.focus();" frameborder="0" referrerpolicy="same-origin" allowTransparency="true" allow="autoplay; fullscreen; accelerometer; gyroscope; geolocation; microphone; camera; midi; encrypted-media; clipboard-read; clipboard-write" sandbox="allow-forms allow-downloads allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation"></iframe></div>');

		self.$body.append(win);

		win.find('iframe').off('load').on('load', function() {
			var $el = $(this);

			if (title === 'EmuChat') {
				var net = window['NETWORK_CONNECTION'];

				if (typeof net !== 'undefined') {
					// noinspection JSUnresolvedVariable
					if (typeof net.register_iframe === 'function') {
						// noinspection JSUnresolvedFunction
						net.register_iframe(title);
						net.badge = 0;
						var $icon = self.$body.find('.emuos-desktop-icon span:contains("EmuChat")').siblings('i.icon').first();
						$icon.attr('class', 'icon badge');
					}
				}
			}

			$el.focus();
			$el.get(0).focus();
			$el.get(0).contentWindow.focus();

			if (typeof window['NETWORK_CONNECTION'] !== 'undefined') {
				if (typeof window['NETWORK_CONNECTION']['socket'] !== 'undefined') {
					// noinspection JSUnresolvedVariable
					if (typeof window['NETWORK_CONNECTION']['socket']['emit_event'] === 'function') {
						// noinspection JSUnresolvedFunction
						window['NETWORK_CONNECTION']['socket']['emit_event']('chat.show', {});
					}
				}
			}
		});

		// noinspection JSValidateTypes
		win.window({
			help: credits,
			newtab: newtab,
			newtabUrl: src,
			fullscreen: true,
			embeddedContent: true,
			// group: title,
			width: width,
			height: height,
			position: {
				my: 'center',
				at: 'center center-' + (height/2 + 14),
				of: this.$window.get(0),
				collision: 'fit'
			},
			icons: {
				main: this.$html.hasClass('theme-basic') || this.$html.hasClass('theme-windows-95') || this.$html.hasClass('theme-windows-98') || this.$html.hasClass('theme-windows-me') ? (icon !== '' ? icon + ($sys.browser.isIE ? '.png' : '.ico') : null) : ''
			}
		});

		// noinspection DuplicatedCode
		$('.emuos-window').contextmenu({
			autoTrigger: false,
			delegate: '.emuos-window-icon',
			menu: [{
				title: 'Restore',
				cmd: 'restore',
				disabled: true
			} , {
				title: 'Move',
				cmd: 'move'
			} , {
				title: 'Size',
				cmd: 'size'
			} , {
				title: 'Minimize',
				cmd: 'minimize'
			} , {
				title: 'Maximize',
				cmd: 'maximize'
			} , {
				title: '----'
			} , {
				title: 'Close',
				cmd: 'close'
			} , {
				title: '----'
			} , {
				title: 'Next',
				cmd: 'next'
			}],
			select: function(e, ui) {
				// noinspection JSRedundantSwitchStatement
				switch (ui.cmd) {
					case 'close':
						// noinspection JSUnresolvedFunction
						$(e.target).children('.window, .iframe').first().window('close');
						break;
				}

				return true;
			},
			close: function (e) {
				console.log(e);
			}
		});

		$('.emuos-window-icon').on('click', function(e) {
			// noinspection JSUnresolvedFunction
			$(this).parents('.emuos-window').first().contextmenu('open', $(this));
			e.preventDefault();
		});

		// noinspection JSValidateTypes
		return win.window('instance');
	};

	return EmuOS;
}));