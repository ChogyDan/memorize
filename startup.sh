#! /bin/dash

position_program ()
{
	$1
	sleep $2
	wmctrl -i -r `wmctrl -l | tail -n1 | cut -f1 -d " "` -e 0,$3,$4,$5,$6
}



gedit --new-window alpha.* &
subl --new-window memorize.html start.html texts.html helpercode.js & disown
google-chrome --new-window start.html & disown
xfce4-terminal --geometry=248x13+3+9823 & disown
sleep 3 && subl --new-window *.css & disown
