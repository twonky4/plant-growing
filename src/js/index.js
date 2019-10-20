require("../scss/style.scss");
require("../index.html");


import { MDCFloatingLabel } from "@material/floating-label";
import { MDCTextField } from "@material/textfield";
import { MDCNotchedOutline } from "@material/notched-outline";
import * as $ from "jquery/dist/jquery.min";

function decorateTextFields() {
	$(".mdc-text-field").each(function(index, textField) {
	    new MDCTextField(textField);
	    let floatingLabel = $(textField).find(".mdc-floating-label")[0];
	    let notchedOutline = $(textField).find(".mdc-noutched-outline")[0];
	    if (floatingLabel) new MDCFloatingLabel(floatingLabel);
	    if (notchedOutline) new MDCNotchedOutline(notchedOutline);
	});	
}

function getNewGreenHouse(id) {
	let g = {
		id: id,
		note: "",
		pots: [
		],
		selectedPot: -1
	};
	for(let i = 0; i < 28; i++) {
		g.pots.push(
			{
				seedDate: null,
				firstDate: null,
				finishDate: null,
				note: "",
			}
		);
	}

	return g;
}

function loadStorage() {
	let p = localStorage.getItem("savePoint");
	let l;
	
	let save = function () {
		localStorage.setItem("savePoint", JSON.stringify(l));
	};
	
	if(p == null) {
		l = {
			greenHouses: [
				getNewGreenHouse(1)
			],
			selectedGreenHouse: 0
		};
	
		save();
	} else {
		try {			
			l = JSON.parse(p);
		} catch(e) {
			localStorage.removeItem("savePoint");
			return loadStorage();
		}
	}
	
	l.save = save;
	
	return l;
}

let savePoint = {};

function drawList() {
	let i = 0;
	$('ul.actionList').empty();
	savePoint.greenHouses.forEach(function (g) {
		let span = $('<span>').attr('class', 'mdc-list-item__text').append(g.id + '. Gewächshaus');
		let li = $('<li>');
		if(i == savePoint.selectedGreenHouse) {
			li.attr('class', 'mdc-list-item mdc-list-item--activated').attr('tabindex', '0');
		} else {
			li.attr('class', 'mdc-list-item');			
		}
		li.append(span);
		
		$('ul.actionList').append(li);   
		let j = i;
		li.click(function() {
			savePoint.selectedGreenHouse = j;
			savePoint.greenHouses[j].selectedPot = -1;
			savePoint.save();
			drawList();
		});
		i++;
	});
	drawGreenHouse();
}

function initAddButton () {
	$('button.actionAddButton').click(function() {
		savePoint.greenHouses.push(getNewGreenHouse(savePoint.greenHouses.length + 1));
		savePoint.selectedGreenHouse = savePoint.greenHouses.length - 1;
		savePoint.save();
		drawList();
	});
}

function initGreenHouseButtons() {
	$('button.actionPot').each(function(index, button) {
		$(button).click(function(event) {
			let g = savePoint.greenHouses[savePoint.selectedGreenHouse];
			if(g.selectedPot == index) {
				g.selectedPot = -1;
			} else {				
				g.selectedPot = index;
			}
			savePoint.save();
			drawGreenHouse();
		});
	});
}

function drawDetails() {
	let g = savePoint.greenHouses[savePoint.selectedGreenHouse];
	if(g.selectedPot == -1) {
		$('textarea.actionText').val(g.note);
		$('input.actionSeed').val('');
		$('input.actionFirst').val('');
		$('input.actionFinish').val('');
	} else {
		let p = g.pots[g.selectedPot];
		$('textarea.actionText').val(p.note);
		$('input.actionSeed').val(p.seedDate);
		$('input.actionFirst').val(p.firstDate);
		$('input.actionFinish').val(p.finishDate);
	}
}

function drawGreenHouse() {
	let g = savePoint.greenHouses[savePoint.selectedGreenHouse];
	$('button.actionPot').each(function(index, button) {
		$(button).removeClass('brownButton').removeClass('darkGreenButton');
		if(g.selectedPot == index) {
			$(button).find("span").text('create');
		} else {
			$(button).find("span").text('');
		}
		let p = g.pots[index];
		if(p.firstDate == '' || p.firstDate == null) {
			$(button).addClass('brownButton');			
		} else {
			$(button).addClass('darkGreenButton');			
		}
	});

	if(g.selectedPot == -1) {
		$('div.actionPotDetails').slideUp();
		drawDetails();
	} else {
		$('div.actionPotDetails').slideDown();		
		drawDetails();
	}	
}

function initGreenTextFields() {
	$('input.actionSeed').change(function() {
		let g = savePoint.greenHouses[savePoint.selectedGreenHouse];
		let p = g.pots[g.selectedPot];
		p.seedDate = $('input.actionSeed').val();
		savePoint.save();
	});

	$('input.actionFirst').change(function() {
		let g = savePoint.greenHouses[savePoint.selectedGreenHouse];
		let p = g.pots[g.selectedPot];
		p.firstDate = $('input.actionFirst').val();
		savePoint.save();

		let b = $('button.actionPot')[g.selectedPot];
		console.log(p.firstDate);
		if(p.firstDate == null || p.firstDate == '') {
			$(b).addClass('brownButton').removeClass('darkGreenButton');			
		} else {
			$(b).removeClass('brownButton').addClass('darkGreenButton');
		}
	});

	$('input.actionFinish').change(function() {
		let g = savePoint.greenHouses[savePoint.selectedGreenHouse];
		let p = g.pots[g.selectedPot];
		p.finishDate = $('input.actionFinish').val();
		savePoint.save();
	});
	
	$('textarea.actionText').change(function() {
		let g = savePoint.greenHouses[savePoint.selectedGreenHouse];
		if(g.selectedPot == -1) {			
			g.note = $('textarea.actionText').val();
		} else {
			let p = g.pots[g.selectedPot];
			p.note = $('textarea.actionText').val();
		}
		savePoint.save();
	});
}

$(document).ready(function() {
	decorateTextFields();

	savePoint = loadStorage();

	initAddButton();
	initGreenHouseButtons();
	initGreenTextFields();
	drawList();
});
