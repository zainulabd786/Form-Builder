const jsonPath = "./json"
const templatePath = "./templates";
const datepicker_theme_dir = "./datepicker-themes";
const formTag = ".fb-form form";
const fieldSettingsTemplate = "field_settings.mst";
const fieldSettingsContainer = "#fb-field-settings .settings-wrapper";
const basicSettingsTemplate = "formSettings/basic.mst";
const basicSettingsContainer = "#fb-basic-settings";
const confSettingsTemplate = "formSettings/confirmation.mst";
const confSettingsContainer = "#fb-confirmation-settings";
const notifSettingsTemplate = "formSettings/notification.mst";
const notifSettingsContainer = "#fb-notifications-settings";
const fieldMainClass = "form-field";
const customCSSTemplate = "custom_css.mst";
const customCSScontainer = "#fb-custom-css";
let isFieldClicked = false;
const assetsPath = "assets";
const datepicker_themes = ["dark", "material_blue", "material_green", "material_red", "orange", "airbnb", "confetti"];
const orderArr = [];
const alreadyInFormFields = [];
const formBuildingJSON = {
	"form_fields" : [],
	"custom_css": ".red{color:red}",
	"form_settings" : {
			"basics" : {
				"title" : "My Custom Form",
				"description": "This is my custom form description",
				"admin_ajax_url": "http://localhost/test.php",
				"client_ajax_url": "https://example.com/file.php",
				"button" : {
					"text" : "Submit",
					"attr" : [ {"type":"button"} ],
					"custom_classes" : "btn btn-primary"
				}
			},
			"confirmation" : {
				"type" : "m",
				"message" : {
					"text" : "Your Form Has been successfully submitted",
					"wrapper" : "h1",
					"attr" : [ {"id":"form-id-1"}, {"data-id":"54321"} ],
					"custom_classes" : "alert alert-success"
				},
				"redirect" : {
					"url" : "https://example.com",
					"query_string" : [ {"message":"Thank you"}, {"form_id":"1"} ]
				}
			},
			"notifications" : {
				"admin" : {
					"to" : [ "abc@edensolutions.co.in", "xyz@premierlister.com" ],
					"from" : "{user-email}",
					"reply_to" : "{user-email}",
					"bcc" : [ "someone@something.com" ],
					"subject" : "Received an order from {user-name}",
					"message" : "You jus received an order from {user-name} for a session"
				},
				"user" : {
					"to" : [ "{user-email}", "xyz@premierl==ter.com" ],
					"from" : "{xyz@premierl==ter.com}",
					"reply_to" : "{xyz@premierl==ter.com}",
					"bcc" : [ "someone@something.com" ],
					"subject" : "Your form has been submitted successfully",
					"message" : "Hi {user-name}, you have successfully submitted the form at our website"
				}
			}
		}
};

export default function formBuilder(opts){
	readTemplate("template.mst").then( template => {
		generateHTML(template, opts, opts.element);
		initDrag()
		initSortable()
		bindEvents()
	} ).catch(e => console.error(e))
}

export let readJSON = async (file) => $.get(`${jsonPath}/${file}`)

let bindEvents = () => {
	applyConditionalLogic();
	removeChoice();
	updateChoice();
	addChoice();
	basicFormSettingsRender();
	confirmationFormSettingsRender();
	notificationFormSettingsRender();
	updateFormSettings();
	fieldWidth();
	deleteField();
	duplicateFields();
	customCSSTabRender();
	clickAppendField();
	loadSavedStyle();
	renderform();
	formEmbedCode();
	buttonOldClass();
	loadDatepickerTheme();
	saveForm();
	generateFormID();
}

let generateFormID = () => {
	formBuildingJSON.form_id = Date.now()
}

let loadSavedStyle = () => {
	$("#fb-custom-css-styles").text(formBuildingJSON.custom_css);
	$(".fb-form-title").text(formBuildingJSON.form_settings.basics.title)
}

let createFormSettingsObject = () => {
	let data = jQuery.extend(true, {}, formBuildingJSON);
	readJSON("admin-form.json").then( i => {
		let fieldData = i.fields.filter( j => parseInt(j.field.id) === parseInt(id));
		return fieldData;
	} ).catch( e => console.error(e) );
}

let readTemplate = async (file) => {
	const request = async () => {
		const response = await $.get(`${templatePath}/${file}`);
		return response; 
	}
	return await request();
}

let generateHTML = (template, data, element) => {
	/*
	* @param
	*	template - accepts mustache template data returned by readTemplate() which needs to be rendered
	*	data - accepts json file as a data source for mustache template which is returned from readJSON() 
	*	element - accepts DOM element where the template nees to be rendered
	*/
	$(element).append(Mustache.render(template, data));
}

let getFieldData = async (id) => {

	return await readJSON("admin-form.json").then( i => {
		let fieldData = i.fields.filter( j => parseInt(j.field.id) === parseInt(id));
		return fieldData;
	} ).catch( e => console.error(e) );

}

let defaultFormSettings = () => {

	readJSON("admin-form.json").then( i => {
		formBuildingJSON.form_settings = jQuery.extend(true, {}, i.form_settings);
	} ).catch( e => console.error(e) );

}

let getUniqueFieldData = (id) => {
	let fieldData = formBuildingJSON.form_fields.filter( i => parseInt(i.field.field_id) === parseInt(id) )
	return fieldData[0];
}

/*let initDrop = () => {
	$( ".droppable" ).droppable({
		activeClass: "ui-state-highlight",
		hoverClass: "drop-hover",
		drop: afterDrop
	})
}*/

let initDrag = () => {
	$( ".draggable" ).draggable({
		connectToSortable: ".droppable",
	    helper: "clone",
	    revert: "invalid",
	    stop: afterDrop
	})
}
let initSortable = () => {
	$( ".droppable" ).sortable({
		revert: true,
		update: reArrangeJSON
	});
}

let reArrangeJSON = () => {
	let data = [];
	let array = [];
	 $(`.${fieldMainClass}`).each(function(){
        let id = $(this).attr('id');
        array.find((v,i)=>v==id && array.splice(i, 1))
        array.push(id);
    });
    array.forEach((v, i)=>{
    	let field = formBuildingJSON.form_fields.filter(val=>val.field.field_id == v)[0];
    	field && data.push(field);
    })
    formBuildingJSON.form_fields = data;
}

let afterDrop = (event, ui) => {
	//let fieldID = ui.item.attr("data-id")	
	let fieldID = $(event.target).attr("data-id")
	getFieldData(fieldID).then(fieldData => {
		fieldData[0].field.field_id = Date.now();
		alreadyInFormFields.push(fieldData[0].field.field_id);
		formBuildingJSON.form_fields.push(fieldData[0]);
		appendFieldsMarkup()
		setTimeout(()=>appendSubmitButton(), 250)
		setTimeout(()=>reArrangeJSON(), 199)
		setTimeout(()=>selectField(fieldData[0].field.field_id), 199)
	})
	$(ui.helper[0]).remove()
}

let clickAppendField = () => {
	$("body").on("click", ".draggable-field", function(){
		isFieldClicked = !isFieldClicked;
		let fieldID = $(this).attr('data-id');
		getFieldData(fieldID).then(fieldData => {
			fieldData[0].field.field_id = Date.now();
			alreadyInFormFields.push(fieldData[0].field.field_id);
			formBuildingJSON.form_fields.push(fieldData[0]);
			appendFieldsMarkup()
			appendSubmitButton()
			setTimeout(()=>appendSubmitButton(), 250)
			setTimeout(()=>reArrangeJSON(), 199)
			setTimeout(()=>selectField(fieldData[0].field.field_id), 199)
		})
	})
}

let initFlatpicker = () => $(".fb-date-input input").flatpickr();

let appendFieldsMarkup = () => {
	let data = jQuery.extend(true, {}, formBuildingJSON);
	
	$(`.${fieldMainClass}`).each(function(){
		let id = $(this).attr("id");
		data.form_fields.forEach((v, i)=>{
			v.field.field_id == id && data.form_fields.splice(i, 1);
		})
	})
	
	data.form_fields.forEach( i => {
		let obj = {};
		obj.wrapperTag = i.field.wrapper.tag;
		//obj.field_id = (i.field.field_id) ? i.field.wrapper.attr.push({"id":i.field.field_id}) : ""; 
		obj.field_id = (i.field.field_id) ? i.field.field_id : "";
		i.field.wrapper.attr = (i.field.field_id) ? addAttr(i.field.wrapper.attr, "id", i.field.field_id) : ""; 
		let visibility = (i.field.visibility === "s") ? true : false;
		i.field.wrapper.attr = (!visibility) ? addAttr(i.field.wrapper.attr, "class", "fb-hidden") : i.field.wrapper.attr;
		i.field.wrapper.attr = (i.field.width_class) ? addAttr(i.field.wrapper.attr, "class", i.field.width_class) : i.field.wrapper.attr;
		i.field.wrapper.attr = addAttr(i.field.wrapper.attr, "class", fieldMainClass);
		i.field.wrapper.attr = (i.field.wrapper.custom_classes) ? addAttr(i.field.wrapper.attr, "class", i.field.wrapper.custom_classes) : i.field.wrapper.attr; /*Add custom Class*/
		if(i.field.id == 7) i.field.wrapper.attr = addAttr(i.field.wrapper.attr, "class", "fb-date-input")
		obj.wrapperAttributes = generateTagAttributes(i.field.wrapper.attr)
		obj.label = i.field.label ? i.field.label.text : "";
		obj.tooltip = (i.field.tooltip) ? i.field.tooltip : false;
		obj.label_placement = i.field.label ? i.field.label.label_placement : "";
		obj.inputTag = (i.field.input && i.field.input.tag) ? i.field.input.tag : "";
		if(i.field.input) i.field.input.attr = (i.field.input && i.field.input.attr) && addAttr(i.field.input.attr, "class", "fb-input")
		if(i.field.input) i.field.input.attr = (i.field.input && i.field.input.attr) && addAttr(i.field.input.attr, "name", i.field.field_name+"_"+Date.now())
		obj.inputAttributes = (i.field.input && i.field.input.attr) ? generateTagAttributes(i.field.input.attr) : "";
		obj.choices = (i.field.input && i.field.input.options) ? i.field.input.options : "";
		obj.label_attributes = (i.field.label) ? generateTagAttributes(i.field.label.attr) : "";
		let required = (i.field.input) ? i.field.input.attr.filter(i => (i.required) && i.required) : "";
		obj.required = (required.length) ? true : false 
		if(i.field.id == 8) obj.address_fields = (i.field.address_fields) ? createMultiFieldObj(i.field.address_fields) : ""; 
		if(i.field.id == 9) obj.name_fields = (i.field.name_fields) ? createMultiFieldObj(i.field.name_fields) : ""; 
		if(i.field.id == 14){ /*for heading field*/
			obj.heading = true;
			obj.tag = i.field.heading.tag;
			obj.headingText = i.field.heading.text;
			obj.headingAttributes = generateTagAttributes(i.field.heading.attr);
		}
		if(i.field.id == 4 || i.field.id == 5 || i.field.id == 6){
			obj.default_value = i.field.input.selected;
		}
		readTemplate(`inputs/${i.field.field_name}.mst`).then( template => {
			!isFieldClicked && $(".ui-sortable-placeholder").after(Mustache.render(template, obj)).fadeIn('slow');
			isFieldClicked && (generateHTML(template, obj, formTag), isFieldClicked = false)
			obj = {};
			i.field.id == 7 && initFlatpicker()
		} ).catch(e => console.error(e))
	} );
}
let createMultiFieldObj = (data) => {
	let arr = [];
	for(let key in data){
		data.hasOwnProperty(key) && arr.push(data[key])
	}
	arr.forEach(i=>{
		i.attr = !i.set ? addAttr(i.attr, "class", "fb-hidden") : i.attr
		i.attr = addAttr(i.attr, "class", "fb-input")
		i.attr = addAttr(i.attr, "name", getAttrVal(i.attr, "id")+"_"+Date.now())
		i.attr = generateTagAttributes(i.attr);
	})
	return arr;
}

let getAttrVal = (array, key) => {
	if(!ifKeyExist(array, key)) return;
	let val;
	array.find((v, i)=> {
		for(let k in v){
				if(v.hasOwnProperty(k)){
					if(k === key){
						val = v[k];
					}
				}
			}
	})
	return val;
}

let generateTagAttributes = (data) => {
	let tempArr = [];
	data.forEach(i => {
		for(let key in i){
			(i.hasOwnProperty(key)) && tempArr.push(`${key}="${i[key]}"`);
		}
	})
	let attributes = tempArr.join(" ");
	return attributes;
}

let selectField = (id) => {
	$(formTag).find(`.${fieldMainClass}`).removeClass("fb-selected");
	$("body").on("click",`.${fieldMainClass}`,function(){
		if(!$(this).hasClass("fb-selected")){
			id = $(this).attr('id');
			$(formTag).find(`.${fieldMainClass}`).removeClass("fb-selected")
			$(formTag).find(`#${id}`).addClass("fb-selected", 400)
			onFieldSelect(id);
			setTimeout(()=> fieldInlineOptions(), 500);
			$(fieldSettingsContainer).empty();
		}
	})
	$(formTag).find(`#${id}`).addClass("fb-selected")
	onFieldSelect(id);
	fieldInlineOptions();
	$(fieldSettingsContainer).empty();
}

let fieldInlineOptions = () => {
	$(".fb-inline-options").remove();
	let markup = "<div class='fb-inline-options row'>"+
					"<div class='col text-left'>"+
						"<span class='field-col-icons' id='one_by_four'><img src='"+assetsPath+"/col-icons/1.svg' /></span>"+
						"<span class='field-col-icons' id='two_by_four'><img src='"+assetsPath+"/col-icons/2.svg' /></span>"+
						"<span class='field-col-icons' id='three_by_four'><img src='"+assetsPath+"/col-icons/3.svg' /></span>"+
						"<span class='field-col-icons' id='four_by_four'><img src='"+assetsPath+"/col-icons/4.svg' /></span>"+
					"</div>"+
					"<div class='col text-right'>"+
						"<i class='field-action far fa-copy p-2' id='fb-duplicate-field'></i>"+
						"<i class='field-action far fa-trash-alt p-2' id='fb-delete-field'></i>"+
					"</div>"+
				"</div>";
	$(".fb-selected").append(markup);
}

let getFieldSettingsObject = (id) => {
	let data = jQuery.extend(true, {}, formBuildingJSON);
	data = data.form_fields.filter( i => parseInt(i.field.field_id) === parseInt(id) )[0].field;
	let field = {};
	let field_list_options = "";
	let field_conditions_markup = "";
	let isHeading = data.id == 14 ? true : false;
	let isDate = data.id == 7 ? true : false;
	field.field_id = data.field_id;
	field.addr_true = false;
	field.name_true = false;
	field.placeholder = data.input ? getAttrVal(data.input.attr, "placeholder") : false;
	field.type = data.field_name;
	field.label = data.label ? data.label.text : "";
	field.tooltip = (data.tooltip) ? data.tooltip : false;
	let required = (data.input) ? data.input.attr.filter(i => (i.required) && i.required) : "";
	field.required = (required.length) ? required[0].required : false 
	field.visibility = (data.visibility === "s") ? true : false;
	field.custom_classes = data.wrapper.custom_classes;
	/**********************************Conditional Logic*************************************/
	field.conditional_logic_set = (data.conditional_logic.set) ? true : false;
	field.selected_val = data.conditional_logic.if.field;
	field.selected_condition = data.conditional_logic.if.condition;
	field.condition_value = data.conditional_logic.if.value ? data.conditional_logic.if.value : "";

	field_conditions_markup += "<option ";
	field_conditions_markup += field.selected_condition == "==" ? "selected" : "";
	field_conditions_markup += " value='==' selected>IS</option>" ;

	field_conditions_markup += "<option ";
	field_conditions_markup += field.selected_condition == "!=" ? "selected" : "";
	field_conditions_markup += " value='!='>IS NOT</option>" ;

	field_conditions_markup += "<option ";
	field_conditions_markup += field.selected_condition == ">" ? "selected" : "";
	field_conditions_markup += " value='<'>GREATER THAN</option>" ;

	field_conditions_markup += "<option ";
	field_conditions_markup += field.selected_condition == "<" ? "selected" : "";
	field_conditions_markup += " value='>'>LESS THAN</option>" ;

	formBuildingJSON.form_fields.forEach(i=>{
		let isHeading = i.field.id == 14 ? true : false;
		let headOrLabel = isHeading ? "heading" : "label";
		field_list_options += "<option ";
		field_list_options += field.selected_val==i.field.field_id ? "selected" : "";
		field_list_options += " value='"+i.field.field_id+"'>"+i.field[headOrLabel].text+"</option>"
	})

	field.field_condition_options = field_conditions_markup;
	field.field_list_options = field_list_options;
	/**********************************Conditional Logic*************************************/

	if(data.id == 4 || data.id == 5 || data.id == 6){ /*radio Buttons, checkboes, dropdown*/
		field.choices = data.input.options;
		field.choiceField = true;
	} 

	if(data.input) {
		if(data.input.selected){
			field.is_default_value = true;
			field.default_value = Array.isArray(data.input.selected) ? data.input.selected.join(",") : data.input.selected;
			Array.isArray(data.input.selected) ? data.input.selected.forEach(i => {
				$(`#${field.field_id} #${i}`).attr("checked", true);
			}) : $(`#${field.field_id} option[value="${data.input.selected}"]`).attr("selected", true)
			
		} else{
			field.is_default_value = true;
			field.default_value = getAttrVal(data.input.attr, "value");	
		}
		
	}

	if(data.id == 8){ /*address field*/
		field.addr_true = true;
		field.street_address_disp = data.address_fields.street_address.set;
		field.fb_addr_line2_disp = data.address_fields.address_line_2.set;
		field.fb_addr_city_disp = data.address_fields.city.set;
		field.fb_addr_state_disp = data.address_fields.state.set;
		field.fb_addr_zip_disp = data.address_fields.zip.set;
		field.fb_addr_country_disp = data.address_fields.country.set;
	}

	if(data.id == 9){ /*Name Field*/
		field.name_true = true;
		field.first_name_disp = data.name_fields.first_name.set;
		field.first_last_disp = data.name_fields.last_name.set;
	}

	if(isHeading){
		field.isHeading = isHeading;
		field.hTag = data.heading.tag;
		field.hText = data.heading.text;
		field.required = false;
		field.tooltip = false;
		field.label = false;
	}

	if(isDate){
		field.isDate = isDate;
		let datepicker_theme_options;
		datepicker_themes.forEach(i=>{
			datepicker_theme_options += '<option ';
			datepicker_theme_options += data.datepicker_settings.theme == i ? "selected" : "";
			datepicker_theme_options += " value='"+i+"'>"+i+"</option>"
		})
		field.datepicker_theme_options = datepicker_theme_options;
	}

	return field;
}

let onFieldSelect = (id) => {
	let data = getFieldSettingsObject(id);
	readTemplate(fieldSettingsTemplate).then( template => {
		generateHTML(template, data, fieldSettingsContainer)
		onSettingChange()
	} ).catch(e => console.error(e))
}

let addAttr = (attr, key, value) => {

	if(ifKeyExist(attr, key)){ /*upadte existing attributes*/
		attr.forEach((v, i)=>{
			for(let k in v){
				if(v.hasOwnProperty(k)){
					if(k === key){
						let atts = v[key]+" "+value
						attr[i][k] = atts;
					}
				}
			}
		});
	} else{ /*add new attribute*/
		attr.push({[key]:value})
	}
	return attr
}


let ifKeyExist = ( arr, key ) => (arr.find(v => v[ key ])) ? true : false;


let onSettingChange = () => {
	$(".field-setting").change(function(){
		let fieldID = $(this).attr('data-id')
		let setting_name = $(this).attr('name');
		let setting_value = $(this).val();
		formBuildingJSON.form_fields.forEach((val, index)=>{
			if(val.field.field_id == fieldID){
				let field = formBuildingJSON.form_fields[index].field;
				switch(setting_name){
					case "label_text":
						field.label.text = setting_value;
						$(`#${fieldID} .label_tag`).text(setting_value);
					break;

					case "tooltip":
						field.tooltip = setting_value;
						$(`#${fieldID} a[data-toggle="tooltip"]`).attr("title", setting_value);
					break;

					case "input_attr_required":
						field.input.attr = addAttr(field.input.attr, "required", $(this).prop("checked") ? true : false);
						$(this).prop("checked") ? $(`#${fieldID} input`).attr("required", true) : $(`#${fieldID} input`).attr("required", false);
						$(this).prop("checked") ? $(`#${fieldID} .required-asterick`).text("*") : $(`#${fieldID} .required-asterick`).text("");
					break;

					case "visibility":
						field.visibility = $(this).filter(':checked').val()
						field.visibility === "s" ? $(`#${fieldID}`).removeClass("fb-hidden") : $(`#${fieldID}`).addClass("fb-hidden")
					break;

					case "conditional_logic_set":
						field.conditional_logic.set = $(this).prop("checked");
						field.conditional_logic.set ? 
							$(".conditional_logic_settings").removeClass("d-none").addClass("d-flex") : 
							$(".conditional_logic_settings").removeClass("d-flex").addClass("d-none")
					break;

					case "fb_addr_street":
						field.address_fields.street_address.set = $(this).prop("checked") ? true : false;
						$(this).prop("checked") &&
							$(`#${fieldID} #fb_addr_street`).hasClass("fb-hidden") ?  
							$(`#${fieldID} #fb_addr_street`).removeClass('fb-hidden') :
							$(`#${fieldID} #fb_addr_street`).addClass("fb-hidden")
					break;

					case "fb_addr_line2":
						field.address_fields.address_line_2.set = $(this).prop("checked") ? true : false;
						$(this).prop("checked") &&
							$(`#${fieldID} #fb_addr_line2`).hasClass("fb-hidden") ?  
							$(`#${fieldID} #fb_addr_line2`).removeClass('fb-hidden') :
							$(`#${fieldID} #fb_addr_line2`).addClass("fb-hidden")
					break;

					case "fb_addr_city":
						field.address_fields.city.set = $(this).prop("checked") ? true : false;
						$(this).prop("checked") &&
							$(`#${fieldID} #fb_addr_city`).hasClass("fb-hidden") ?  
							$(`#${fieldID} #fb_addr_city`).removeClass('fb-hidden') :
							$(`#${fieldID} #fb_addr_city`).addClass("fb-hidden")
					break;

					case "fb_addr_state":
						field.address_fields.state.set = $(this).prop("checked") ? true : false;
						$(this).prop("checked") &&
							$(`#${fieldID} #fb_addr_state`).hasClass("fb-hidden") ?  
							$(`#${fieldID} #fb_addr_state`).removeClass('fb-hidden') :
							$(`#${fieldID} #fb_addr_state`).addClass("fb-hidden")
					break;

					case "fb_addr_zip":
						field.address_fields.zip.set = $(this).prop("checked") ? true : false;
						$(this).prop("checked") &&
							$(`#${fieldID} #fb_addr_zip`).hasClass("fb-hidden") ?  
							$(`#${fieldID} #fb_addr_zip`).removeClass('fb-hidden') :
							$(`#${fieldID} #fb_addr_zip`).addClass("fb-hidden")
					break;

					case "fb_addr_country":
						field.address_fields.zip.set = $(this).prop("checked") ? true : false;
						$(this).prop("checked") &&
							$(`#${fieldID} #fb_addr_country`).hasClass("fb-hidden") ?  
							$(`#${fieldID} #fb_addr_country`).removeClass('fb-hidden') :
							$(`#${fieldID} #fb_addr_country`).addClass("fb-hidden")
					break;

					case "fb_last_name":
						field.name_fields.last_name.set = $(this).prop("checked") ? true : false;
						$(this).prop("checked") &&
							$(`#${fieldID} #fb_last_name`).hasClass("fb-hidden") ?  
							$(`#${fieldID} #fb_last_name`).removeClass('fb-hidden') :
							$(`#${fieldID} #fb_last_name`).addClass("fb-hidden")
					break;

					case "fb_first_name":
						field.name_fields.first_name.set = $(this).prop("checked") ? true : false;
						$(this).prop("checked") &&
							$(`#${fieldID} #fb_first_name`).hasClass("fb-hidden") ?  
							$(`#${fieldID} #fb_first_name`).removeClass('fb-hidden') :
							$(`#${fieldID} #fb_first_name`).addClass("fb-hidden")
					break;

					case "placeholder_text":
						field.input.attr = updateQSData(field.input.attr, "placeholder", setting_value);
						$(`#${fieldID} input`).attr("placeholder", setting_value);
					break;

					case "custom_classes":
						field.wrapper.custom_classes = setting_value;
						let oldVal = $(this).data('val');
						$(`#${fieldID}`).removeClass(oldVal);
						$(`#${fieldID}`).addClass(setting_value);

					break;

					case "heading_tag":
						$(`#${fieldID} ${field.heading.tag}`).replaceWith(`<${setting_value}>${$(`#${fieldID} ${field.heading.tag}`).html()}</${setting_value}>`);
						field.heading.tag = setting_value;
					break;

					case "heading_text":
						field.heading.text = setting_value;
						$(`#${fieldID} ${field.heading.tag}`).text(setting_value)
					break;

					case "datepicker_theme":
						field.datepicker_settings.theme = setting_value;
					break;

					case "default_value":
						if(field.id == 4){ /*Radio*/
							field.input.selected = [setting_value];
							$(`#${fieldID} #${setting_value}`).attr("checked", true);
						} else if(field.id == 5) { /*Checkbox*/
							$(`#${fieldID} input`).attr("checked", false)
							field.input.selected = setting_value.split(",");
							setting_value.split(",").forEach(i=>$(`#${fieldID} #${i}`).attr("checked", true))
						} else if(field.id == 6){ /*dropdown*/
							field.input.selected = setting_value;
							$(`#${fieldID} option[value='${setting_value}']`).attr("selected", true)
						} else{
							field.input.attr = updateQSData(field.input.attr, "value", setting_value)
							$(`#${fieldID} input`).val(setting_value);
						}
						console.log(formBuildingJSON)
					break;

					case "conditional_logic_field_list":
					case "conditional_logic_bool":
					case "conditional_logic_val":
						switch($(this).attr('id')){
							case "conditional_logic_field_list":
								field.conditional_logic.if.field = $(this).val();
							break;

							case "conditional_logic_bool":
								field.conditional_logic.if.condition = $(this).val();
							break;

							case "conditional_logic_val":
								field.conditional_logic.if.value = $(this).val();
							break;

						}
						
					break;
				} 
			}
		})
	})
	$("body").on("focusin", ".custom-class-input", function(){
		$(this).data('val', $(this).val());
	})
}

let getDependentFields = (id) => {
	/*get all the fields that depends upon {id} field for their visibility set by conditional logic*/

	let fields = formBuildingJSON.form_fields.filter( i => i.field.conditional_logic.if.field == id);

	return fields
}

let applyConditionalLogic = () => {
	$("body").on("change", ".fb-input", function(){
		let input = $(this);
		let fieldID = input.parent().attr('id');
		let hiddenFields = getDependentFields(fieldID)
		hiddenFields.forEach(i => {
			let ifCondition = i.field.conditional_logic.if
			//console.log(input.val(), ifCondition, ifCondition.value);
			!compareConditionalLogic(input.val(), ifCondition.condition, ifCondition.value) ? 
				$(`#${i.field.field_id}`).addClass("fb-hidden") : $(`#${i.field.field_id}`).removeClass("fb-hidden")
		});
	})
}

let compareConditionalLogic = (val1, operator, val2) =>{
	let ret;

	switch(operator){
		case "==":
			ret = val1 == val2;
		break;

		case "!=":
			ret = val1 != val2;
		break;

		case ">":
			ret = val1 > val2;
		break;

		case "<":
			ret = val1 < val2;
		break;
	}

	return ret;
}

let removeChoice = () => {
	$("body").on("click", ".fb-remove-choice", function(){
		let fieldID = $(this).attr("data-id");
		let optionVal = $(this).val();
		formBuildingJSON.form_fields.forEach((val, index)=>{
			let field = formBuildingJSON.form_fields[index].field;
			if(field.field_id==fieldID){
				field.input.options = field.input.options.filter( i => i !== optionVal );
				$(`#${fieldID}`).find(`option[value='${optionVal}'], .custom-control[data-id='${optionVal}']`).remove();
				$(this).parents('.input-group').remove()
			}
		})
	})
}

let updateChoice = () => {
	$("body").on("focusin", ".choice-input", function(){
		$(this).data('val', $(this).val());
	}).on("change", ".choice-input", function(){
		let fieldID = $(this).attr("data-id");
		let optionVal = $(this).val()
		let oldVal = $(this).data('val');
		formBuildingJSON.form_fields.forEach((val, index)=>{
			let field = formBuildingJSON.form_fields[index].field;
			if(field.field_id==fieldID){
				let options = field.input.options
				options.forEach((v, i)=> options[i] = v == oldVal ? optionVal : v  )
				$(`#${fieldID}`).find(`option[value='${oldVal}'], .custom-control[data-id='${oldVal}'] .choice-text`).text(optionVal); /*text in Form*/
				$(`#${fieldID}`).find(`option[value='${oldVal}']`).attr("value", optionVal) /*option value in form*/
				$(`#${fieldID}`).find(`.custom-control[data-id='${oldVal}']`).attr("data-id", optionVal) /*custom-control div data-id in form*/
				$(`#${fieldID}`).find(`.custom-control input[id='${oldVal}']`).attr("id", optionVal) /*custom-control input id in form*/
				$(`#${fieldID}`).find(`.custom-control label[for='${oldVal}']`).attr("for", optionVal) /*label for attribute in form*/
				$(`.fb-remove-choice[value='${oldVal}'].fb-remove-choice[data-id='${fieldID}']`).val(optionVal) /*remove-button value in settings*/
				$(`.fb-choices-wrapper input[value='${oldVal}']`).attr("value", optionVal) /*update input value in settings*/
				$(this).data('val', optionVal);
			}
		})
	})
}


let addChoice = () => {
	$("body").on("click", ".fb-add-choice", function(){
		let fieldID = $(this).attr("data-id");
		let optionVal = "choice_"+Date.now();
		let settingMarkup = '<div class="input-group">'+
						'<input type="text" class="form-control choice-input" placeholder="option" value="'+optionVal+'" data-id="'+fieldID+'">'+
						'<div class="input-group-append">'+
							'<button class="btn btn-danger fb-remove-choice" type="button" value="'+optionVal+'" data-id="'+fieldID+'">x</button>'+
			  			'</div>'+
					'</div>';
		let radioMarkup = '<div data-id="'+optionVal+'" class="custom-control custom-radio" >'+
								'<'+getUniqueFieldData(fieldID).field.input.tag+' '+generateTagAttributes(getUniqueFieldData(fieldID).field.input.attr)+' name="radiobutton_'+fieldID+'" value="'+optionVal+'" id="'+optionVal+'"><span class="choice-text">'+optionVal+'</span>'+
								'<label class="custom-control-label" for="'+optionVal+'"></label>'+
							'</div>';
		let checkboxMarkup = '<div data-id="'+optionVal+'" class="custom-control custom-checkbox">'+
								'<'+getUniqueFieldData(fieldID).field.input.tag+' '+generateTagAttributes(getUniqueFieldData(fieldID).field.input.attr)+' name="'+optionVal+'" value="'+optionVal+'" id="'+optionVal+'"><span class="choice-text">'+optionVal+'</span>'+
								'<label for="'+optionVal+'" class="custom-control-label"></label>'+
							'</div>';
		let dropdownMarkup = `<option value="${optionVal}">${optionVal}</option>`;
		$(`#${fieldID} select`).append(dropdownMarkup)
		$(`#${fieldID} .fb-radio-wrapper`).append(radioMarkup)
		$(`#${fieldID} .fb-check-wrapper`).append(checkboxMarkup)
		$(".fb-choices-wrapper").append(settingMarkup);

		formBuildingJSON.form_fields.forEach((val, index)=>{
			let field = formBuildingJSON.form_fields[index].field;
			if(field.field_id==fieldID){
				field.input.options.push(optionVal);
			}
		});
	})
}


let basicFormSettingsRender = () => {
	let data = jQuery.extend(true, {}, formBuildingJSON.form_settings.basics);
	readTemplate(basicSettingsTemplate).then( template => {
		generateHTML(template, data, basicSettingsContainer)		
	} ).catch(e => console.error(e))	
}

let confirmationFormSettingsRender = () => {
	let data = jQuery.extend(true, {}, formBuildingJSON.form_settings.confirmation);
	data.m_true = data.type === "m" ? true : false;
	data.qs = [];
	data.query_string = decodeQS(data.redirect.query_string, ":", ",");
	readTemplate(confSettingsTemplate).then( template => {
		generateHTML(template, data, confSettingsContainer)		
	} ).catch(e => console.error(e))
}

let notificationFormSettingsRender = () => {
	let data = jQuery.extend(true, {}, formBuildingJSON.form_settings.notifications);
	readTemplate(notifSettingsTemplate).then( template => {
		generateHTML(template, data, notifSettingsContainer)		
	} ).catch(e => console.error(e))
}

let customCSSTabRender = () => {
	let data = jQuery.extend(true, {}, formBuildingJSON);
	readTemplate(customCSSTemplate).then( template => {
		generateHTML(template, data, customCSScontainer)		
	} ).catch(e => console.error(e))
}

let updateFormSettings = () => {
	$("body").on("change", ".fb-form-setting", function(){
		let settingName = $(this).attr("name");
		let settingVal = $(this).val();
		switch(settingName){
			case "fb_form_title":
				formBuildingJSON.form_settings.basics.title = settingVal;
				$(".fb-form-title").text(settingVal);
			break;

			case "fb_form_description":
				formBuildingJSON.form_settings.basics.description = settingVal;
			break;

			case "fb_form_admin_ajax_url":
				formBuildingJSON.form_settings.basics.admin_ajax_url = settingVal;
			break;

			case "fb_form_client_ajax_url":
				formBuildingJSON.form_settings.basics.client_ajax_url = settingVal;
			break;

			case "fb_form_button_text":
				formBuildingJSON.form_settings.basics.button.text = settingVal;
				$(".fb-submit-button").text(settingVal);
			break;

			case "fb_form_button_class":
				formBuildingJSON.form_settings.basics.button.custom_classes = settingVal;
				let oldVal = $(this).data('val');
				$(".fb-submit-button").removeClass(oldVal);
				$(".fb-submit-button").addClass(settingVal);
			break;

			case "confirmation_type":
				let selected_type = $("input[name='confirmation_type']:checked").val();
				formBuildingJSON.form_settings.confirmation.type = selected_type;
				if(selected_type === "m"){
					$(".message-settings-wrapper input").attr("disabled", false);
					$(".redirect-settings-wrapper input").attr("disabled", true);
				} else{
					$(".message-settings-wrapper input").attr("disabled", true);
					$(".redirect-settings-wrapper input").attr("disabled", false);
				}
			break;

			case "conf_message_text":
				formBuildingJSON.form_settings.confirmation.message.text = settingVal;
			break;

			case "conf_message_wrapper":
				formBuildingJSON.form_settings.confirmation.message.wrapper = settingVal;
			break;

			case "conf_message_classes":
				formBuildingJSON.form_settings.confirmation.message.custom_classes = settingVal;
			break;

			case "conf_redirect_url":
				formBuildingJSON.form_settings.confirmation.redirect.url = settingVal;
			break;	

			case "conf_redirect_qs":
				formBuildingJSON.form_settings.confirmation.redirect.query_string = encodeQS(settingVal, ":", ",");
			break;

			case "admin_notification_to":
				formBuildingJSON.form_settings.notifications.admin.to = settingVal;
			break;

			case "admin_notification_from":
				formBuildingJSON.form_settings.notifications.admin.from = settingVal;
			break;

			case "admin_notification_replyto":
				formBuildingJSON.form_settings.notifications.admin.reply_to = settingVal;
			break;

			case "admin_notification_bcc":
				formBuildingJSON.form_settings.notifications.admin.bcc = settingVal;
			break;

			case "admin_notification_subject":
				formBuildingJSON.form_settings.notifications.admin.subject = settingVal;
			break;

			case "admin_notification_message":
				formBuildingJSON.form_settings.notifications.admin.message = settingVal;
			break;

			case "user_notification_to":
				formBuildingJSON.form_settings.notifications.user.to = settingVal;
			break;
			
			case "user_notification_from":
				formBuildingJSON.form_settings.notifications.user.from = settingVal;
			break;

			case "user_notification_replyto":
				formBuildingJSON.form_settings.notifications.user.reply_to = settingVal;
			break;

			case "user_notification_bcc":
				formBuildingJSON.form_settings.notifications.user.bcc = settingVal;
			break;

			case "user_notification_subject":
				formBuildingJSON.form_settings.notifications.user.subject = settingVal;
			break;

			case "user_notification_message":
				formBuildingJSON.form_settings.notifications.user.message = settingVal;
			break;

			case "custom_css_text":
				formBuildingJSON.custom_css = settingVal;
				$("#fb-custom-css-styles").text(settingVal);
			break;
		}
	})
}

let fieldWidth = () => {
	$("body").on("click", ".field-col-icons", function(){
		$(this).parents(".fb-selected").removeClass(function (index, className) {
			    return (className.match (/(^|\s)col-\S+/g) || []).join(' ');
		});
		let currID = $(this).attr("id");
		let fieldID = $(this).parents(".fb-selected").attr('id');
		switch(currID){
			case "one_by_four":
				$(this).parents(".fb-selected").addClass("col-sm-12");
				formBuildingJSON.form_fields.forEach( (v, i) => { if(v.field.field_id == fieldID) formBuildingJSON.form_fields[i].field.width_class = "col-sm-12" })
			break;

			case "two_by_four":
				$(this).parents(".fb-selected").addClass("col-sm-6");
				formBuildingJSON.form_fields.forEach( (v, i) => { if(v.field.field_id == fieldID) formBuildingJSON.form_fields[i].field.width_class = "col-sm-6"  })
			break;

			case "three_by_four":
				$(this).parents(".fb-selected").addClass("col-sm-4");
				formBuildingJSON.form_fields.forEach( (v, i) => { if(v.field.field_id == fieldID) formBuildingJSON.form_fields[i].field.width_class = "col-sm-4"  })
			break;

			case "four_by_four":
				$(this).parents(".fb-selected").addClass("col-sm-3");
				formBuildingJSON.form_fields.forEach( (v, i) => { if(v.field.field_id == fieldID) formBuildingJSON.form_fields[i].field.width_class = "col-sm-3"  })
			break;
		}
	});
	
}

let deleteField = () => {
	$("body").on("click", "#fb-delete-field", function(){
		let fieldID = $(this).parents(".fb-selected").attr('id');
		let elIndex;
		formBuildingJSON.form_fields.find((v, i)=>{
			if(v.field.field_id == fieldID){
				elIndex = i
			}
		})
		formBuildingJSON.form_fields.splice(elIndex, 1);
		$(this).parents(".fb-selected").remove();
	});

}

let decodeQS = (qsArray, kvSeparator, vSeparator) => {
	let arr = [];
	qsArray.forEach((v, i)=>{
  	for(let key in v){
    	arr.push(`${key}${kvSeparator}${v[key]}`);
    }
  })
  return arr.join(vSeparator);
}


let encodeQS = (str, kvSeparator, vSeparator) => {
	let array = str.split(vSeparator);
	array.forEach((v, i) => {
		let arr = v.split(kvSeparator);
		array[i] = JSON.parse(`{"${arr[0]}":"${arr[1]}"}`);
	})
	return array;
}

let updateQSData = (qsArray, key, value) => {
	if(ifKeyExist(qsArray, key)){ /*upadte existing attributes*/
		qsArray.forEach((v, i)=>{
			for(let k in v){
				if(v.hasOwnProperty(k)){
					if(k === key){
						let atts = value
						qsArray[i][k] = atts;
					}
				}
			}
		});
	} else{ /*add new attribute*/
		qsArray.push({[key]:value})
	}
	return qsArray;
}

let duplicateFields = () =>{
	$("body").on("click", "#fb-duplicate-field", function(){
		let fieldID = $(this).parents(".fb-selected").attr('id');
		let elIndex;
		let copiedJSON;
		let copeidMarkup = $(`#${fieldID}`).clone()
		formBuildingJSON.form_fields.find((v, i)=>{
			if(v.field.field_id == fieldID){
				elIndex = i;
				copiedJSON = $.extend(true, {}, v);
				copiedJSON.field.field_id = Date.now()
			}
		})
		formBuildingJSON.form_fields.splice( elIndex, 0, copiedJSON );
		copeidMarkup.attr('id', copiedJSON.field.field_id);
		copeidMarkup.removeClass("fb-selected");
		$(`#${fieldID}`).after(copeidMarkup.wrap('<p/>').parent().html());
		//$(this).parents(".form-field").removeClass("fb-selected");
		//$(this).parents(".form-field").find(".fb-inline-options").remove();
		//$(".fb-field-settings").find("input, select, button").attr("data-id", copiedJSON.field.field_id);
	})
}


let renderform = () => {
	$("body").on("click", ".preview-tab", function(){
		$("#fb-preview").html($(".fb-form").html())
		$("#fb-preview .form-field").removeClass("fb-selected");
		$("#fb-preview .fb-inline-options").remove()
		$("#fb-preview .fb-hidden").attr("required", false)
		$("#fb-preview .fb-hidden").css({"display":"none", "visibility":"hidden"});
		initFlatpicker()
	})
}


let formEmbedCode = () => {
	$("body").on("click", ".fb-embed-button", function(){
		$(".preview-tab").trigger("click");
		let embedCode;
		let scriptsNstyles = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">'+
							'<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>'+
							'<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>'+
							'<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>'+
							'<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>'+
							'<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">'+
							'<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>';

		$("#fb-preview .external-scripts-container").append(scriptsNstyles);
		embedCode = "";
		embedCode += $("#fb-preview").html();
		embedCode += '<script>jQuery(".fb-date-input input").flatpickr();</script>';
		$(".embed-text").val(embedCode);
	})
}

let appendSubmitButton = () => {
	$(".fb-submit-button").remove();
	let buttonOpt = formBuildingJSON.form_settings.basics.button;
	buttonOpt.attr = addAttr(buttonOpt.attr, "class", buttonOpt.custom_classes);
	buttonOpt.attr = addAttr(buttonOpt.attr, "class", "fb-submit-button");
	$(formTag).append(`<button ${generateTagAttributes(buttonOpt.attr)}>${buttonOpt.text}</button>`)
}

let buttonOldClass = () => {
	$("body").on("focusin", "#fb_form_button_class", function(){
		$(this).data('val', $(this).val());
	})
}

let saveForm = () => {
	$("body").on("click", "#fb-save-form", function(){
		let ajax_url = formBuildingJSON.form_settings.basics.admin_ajax_url;
		formBuildingJSON.action = "save_form";
		$.post(ajax_url, formBuildingJSON, function(resp){
			console.log(resp);
		})
	})
}

let loadDatepickerTheme = () => {
	$("body").on("click", ".fb-date-input", function(){
		let fieldID = $(this).attr("id");
		let fieldTheme = formBuildingJSON.form_fields.filter( i => i.field.field_id == fieldID)[0].field.datepicker_settings.theme;
		$.get(`${datepicker_theme_dir}/${fieldTheme}.css`, function(resp){
			$(".fb-datepicker-theme-styles").text(resp);
		})
	})
}

