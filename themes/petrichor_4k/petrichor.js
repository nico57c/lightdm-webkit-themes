var password_prompt = false;
var selected_user = null;
var selected_session = null;
var time_remaining = 0;

function show_element(id)
{
	document.getElementById(id).classList.add('shown');
}

function hide_element(id)
{
	document.getElementById(id).classList.remove('shown');
}

function show_prompt(text, type)
{
	password_prompt = true;
	document.getElementById('prompt-title').innerHTML = text;
	document.getElementById('users').classList.remove('shown');
	document.getElementById('prompt-container').classList.add('shown');

	let input = document.createElement('input');
	document.getElementById('prompt-entry').appendChild(input);
	input.type = 'password';
	input.value = '';
	input.focus();


}

function show_message(text, type)
{
	let messageContainer = document.getElementById('message-container');
	document.getElementById('message-label').innerHTML = text;

	if (text.length > 0)
	{
		var selected = document.getElementById("user-" + selected_user);
		let userPosition = selected.getBoundingClientRect();

		messageContainer.style.top = userPosition.top + "px";
		messageContainer.style.left = userPosition.left + "px";
		messageContainer.classList.toggle('shown', true);

	} else {
		messageContainer.classList.remove('shown', false);
	}
}

function reset()
{
	document.getElementById('password-container').classList.remove("shown");
	password_prompt = false;
}

function authentication_complete()
{
	if (lightdm.is_authenticated)
		lightdm.start_session_sync(lightdm.authentication_user, selected_session);
	else
		show_message('<span class="error-icon">&#x26A0;</span> Authentication Failed');

	reset();
}

function start_authentication(username)
{
	document.getElementById('prompt-container').classList.remove("shown");

	if (!password_prompt) {
		selected_user = username;
		lightdm.authenticate(username);
	}
}

function provide_secret()
{
	lightdm.respond(document.getElementById('prompt-entry').firstElementChild.value);
	document.getElementById('prompt-entry').remove();
	document.getElementById('promt-container').classList.remove('shown');
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
	if (time_remaining >= 0)
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

		html += '<a href="#" class="user" id="user-' + user.name +'" onclick="start_authentication(\'' + user.name + '\')">';
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

/* Temporary hack until webkit greeter 3.
 * The fact this is needed frankly makes me shudder. */
function try_load()
{
	if (typeof lightdm !== 'undefined') {
		load();
	} else {
		setTimeout(try_load, 500);
	}
}

window.onload = try_load;
