#! /bin/dash
position_program ()
{
	$1 &
	sleep $2
	window_id=`wmctrl -l | tail -n1 | cut -f1 -d " "`
	wmctrl -ir $window_id  -e 0,$3
	if [ ! -z "$4" ]; then
		wmctrl -ir $window_id -t $4
	fi
	echo "\"$1\" has been placed"
}

position_program  "gedit --new-window alpha.*"  5  "779,790,819,357" 0
position_program "subl --new-window memorize.html start.html texts.html helpercode.js" 3 "718,0,875,864"
position_program "google-chrome --new-window start.html" 3 "0,0,732,710"
position_program lxterminal 2 "0,917,1153,230" 
position_program "subl --new-window *.css" 3 "718,4,880,860"
bash

<<MYDOC
Argument 1 should be the command to execute, in quotes.

Argument 2 is the amount of time to wait.  The script needs to know how long to wait between when a command is run, and when the window actually appears.

Argument 3 is a geometry specification of x,y,width,height.  You can use the command 

    xwininfo | grep "upper-left\|Width\|Height"
to help you get proper values for this. Run the command, click on the window with the desired geometry.  Subtract the relative from the absolute to get the correct x and y values.

Argument 4 is structured to be optional, and added in response to your question.  It takes an integer representing which desktop to move the window to.  The enumeration starts with 0, so your first desktop is 0, 2nd at 1, and so on

MYDOC