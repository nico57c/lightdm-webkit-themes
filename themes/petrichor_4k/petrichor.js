var prompt_password = false;
var prompt_message = false;
var selected_user = null;
var focused_user = null;
var focused_onpowerconfirm = false;
var selected_session = null;
var time_remaining = 0;

function toggle_menu(force = null)
{
	const state = force === null? !document.getElementById('power-confirm').classList.contains('shown'): force;
	if(state === true) {
		document.getElementById('power-confirm').classList.add('shown');
		document.getElementById('menu').classList.add('menu-focus');
		focused_onpowerconfirm = true;
	} else {
		document.getElementById('power-confirm').classList.remove('shown');
		document.getElementById('menu').classList.remove('menu-focus');
		Array.from(document.querySelectorAll('#power-confirm .menu-focus')).forEach(function(el) {
			el.classList.remove('menu-focus');
		});
		focused_onpowerconfirm = false;
	}
}

function show_prompt(text, type)
{
	prompt_password = true;
	document.getElementById('prompt-title').innerHTML = text;
	document.getElementById('users').classList.remove('shown');
	document.getElementById('prompt-container').classList.add('shown');
	document.getElementById('prompt-action-cancel').style.display = 'inline-block';
	document.getElementById('prompt-action-ok').style.display = 'inline-block';

	let input = document.createElement('input');
	document.getElementById('prompt-entry').appendChild(input);
	input.type = 'password';
	input.value = '';
	input.focus();
}

function show_message(text, type)
{
	prompt_message = true;
	document.getElementById('prompt-title').innerHTML = 'Message';
	document.getElementById('users').classList.remove('shown');
	document.getElementById('prompt-container').classList.add('shown');
	document.getElementById('prompt-label').innerHTML = text;
	document.getElementById('prompt-action-cancel').style.display = 'inline-block';
	document.getElementById('prompt-action-ok').style.display = 'none';
}

function reset_prompt()
{
	document.getElementById('prompt-container').classList.remove("shown");

	Array.from(document.getElementById('prompt-label').childNodes).forEach(function(element){ element.remove() });
	Array.from(document.getElementById('prompt-entry').childNodes).forEach(function(element){ element.remove() });

	document.getElementById('users').classList.add('shown');
	prompt_password = false;
	prompt_message = false;
}

function authentication_complete()
{
	if (lightdm.is_authenticated === true)
		lightdm.start_session_sync(lightdm.authentication_user, selected_session);
	else
		show_message('<span class="error-icon">&#x26A0;</span> Authentication Failed');
}

function start_authentication(username)
{
	document.getElementById('prompt-container').classList.remove("shown");

	if (!prompt_password) {
		selected_user = username;
		lightdm.authenticate(username);
	}
}

function provide_secret()
{
    const value = document.getElementById('prompt-entry').firstElementChild.value;
	reset_prompt();
	lightdm.respond(value);
}

function autologin_timer_expired(username)
{
	lightdm.authenticate(lightdm.autologin_user);
}

function countdown()
{
	label = document.getElementById('countdown-label');
	label.innerHTML = ' in ' + time_remaining + ' seconds';
	time_remaining--;
	if(time_remaining >= 0)
		setTimeout(countdown, 1000);
}

function build_session_list()
{
	let element = createSelectBox(lightdm.sessions, lightdm.sessions[0], function(selectedItem){
		selected_session = selectedItem.key;
	});
	document.getElementById("session-list").appendChild(element);
}

const blinking=true;
var blinkState=false;

function update_time()
{
	var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
	var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	var d = new Date();
	niceHours = d.getHours();
	niceMinutes = d.getMinutes();
	// I'm yearning for strftime
	if (niceHours < 10)
		niceHours = "0"+niceHours;
	if (niceMinutes < 10)
		niceMinutes = "0"+niceMinutes;
	document.getElementById('date').innerHTML = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()];
	document.getElementById('time').innerHTML = niceHours + (blinking? (blinkState?" ":":") :":") + niceMinutes;

	blinkState=!blinkState;

	setTimeout(update_time, 1000);
}

function start()
{
	var html = "";
	for (i in lightdm.users)
	{
		user = lightdm.users[i];

		if (user.image == null)
			image = '/usr/share/icons/Adwaita/32x32/emotes/face-laugh-symbolic.symbolic.png';
		else
			image = user.image;

		html += '<a href="#" class="user" id="user-' + user.name +'" onclick="start_authentication(\'' + user.name + '\')" ' +
			'onmouseover="focusOnNextUser(null); focused_user = \'user-' + user.name + '\'" ' +
			'onmouseout="focused_user=null">';
		html += '<img class="avatar" src="file:///' + image + '" /><span class="name">'+user.display_name+'</span>';

		if (user.name == lightdm.autologin_user && lightdm.autologin_timeout > 0)
			html += '<span id="countdown-label"></span>';

		html += '</a>';
	}

	document.getElementById('users').innerHTML = html;

	time_remaining = lightdm.autologin_timeout;
	if (time_remaining > 0) countdown();
}

function load()
{
	update_time();
	build_session_list();
	start();
}

function try_load()
{
	if (typeof lightdm !== 'undefined') {
		load();
	} else {
		setTimeout(try_load, 500);
	}
}


window.onkeydown = function(e) {

	e.stopPropagation();
	e.stopImmediatePropagation();

	if(!prompt_password && !prompt_message) {
		var event = new MouseEvent('mouseover', {
			'view': window,
			'bubbles': true,
			'cancelable': true
		});

		let nextUserId = null;
		let nextMenuId = null;

		switch (e.code) {
			case 'ArrowDown':
			case 'ArrowRight':
				if(focused_onpowerconfirm)focusOnNextMenuItem(1);
				else focusOnNextUser(1);
				return false;
			case 'ArrowUp':
			case 'ArrowLeft':
				if(focused_onpowerconfirm) focusOnNextMenuItem(-1);
				else focusOnNextUser(-1);
				return false;
			case 'Enter':
				if(focused_onpowerconfirm) {
					if(null !== document.querySelector('#power-confirm .menu-focus a')){
						document.querySelector('#power-confirm .menu-focus a').click();
					} else {
						toggle_menu(false);
					}
				} else {
					if (focused_user !== null) {
						document.getElementById(focused_user).click();
					}
				}
				return false;
			case 'Tab':
				toggle_menu(null);
				return false;
			case 'Escape':
				if(focused_onpowerconfirm == true) toggle_menu(null);
				return false;
			default:
				console.log(e.code);
				break;
		}
	} else {
		if(e.code ==  'Escape') {
			reset_prompt();
			toggle_menu(false);
		} else if(e.code == 'Enter' && prompt_password) {
			provide_secret();
		}
	}

};

function focusOnNextMenuItem(index) {

    let nextItem = document.querySelector('#power-confirm li.menu-focus');

	while (index !== 0) {
		if(nextItem == null){
			nextItem = index > 0 ? document.querySelector('#power-confirm').firstElementChild : document.querySelector('#power-confirm').lastElementChild;
			index = index > 0 ? index-1 : index+1;
		} else {
			nextItem = index > 0 ? nextItem.nextElementSibling : nextItem.previousElementSibling;
			if(nextItem !== null) index = index > 0 ? index-1 : index+1;
		}
	}

	Array.from(document.getElementsByClassName('menu-focus')).forEach(function(element){
		element.classList.remove('menu-focus');
	});

	if (nextItem !== null) {
		nextItem.classList.add('menu-focus');
	}
}

function focusOnNextUser(index) {

	if(index === 0) return;

	let nextItem = null;
	if(focused_user !== null) {
		nextItem = document.getElementById(focused_user);
	}

	while (index !== 0) {
		if(nextItem == null){
			nextItem = index>0 ? document.getElementById('users').firstElementChild : document.getElementById('users').lastElementChild;
			index = index > 0 ? index-1 : index+1;
		} else {
			nextItem = index > 0 ? nextItem.nextElementSibling : nextItem.previousElementSibling;
			if(nextItem !== null) index = index > 0 ? index-1 : index+1;
		}
	}

	Array.from(document.getElementsByClassName('user-focus')).forEach(function(element){
		element.classList.remove('user-focus');
	});

	if (nextItem !== null) {
		nextItem.classList.add('user-focus');
		focused_user = nextItem.getAttribute('id');
	}
}

window.onload = try_load;
