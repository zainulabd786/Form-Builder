import formBuilder, {readJSON} from './functions.js'

(function($){
    $.fn.formBuilder = function(options){
    	
    	readJSON("admin-form.json").then( i => {
    		let opts = $.extend({}, i, options )
        	formBuilder(opts);
    	} ).catch(e => console.error(e))
    	
    }
}(jQuery))

/*
(function($){
	'use-strict'

	$.fn.formBuilder = function(opts){

		$.getJSON('json/admin-form.json').then(fieldsData => {
			$.get('templates/template.mst', function(template) {
			let rendered = Mustache.render(template, fieldsData);
		    $('#form-builder').html(rendered);
		});

		$( ".draggable" ).draggable({
		    		cursor: "crosshair",
		    		helper: "clone",
		    		opacity: 0.35,
		    		snap: true,
		    		refreshPositions: true
		    	})
				$( ".droppable" ).droppable({
					activeClass: "ui-state-highlight",
					hoverClass: "drop-hover",
					drop: function(event, ui){
						let fieldID = ui.draggable.attr("data-id");
						appendBuilderField(fieldID);
					}
				})
		});
		
	}
	
}(jQuery))*/