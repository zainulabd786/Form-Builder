const jsonPath = "./json"
const templatePath = "./templates";
const formTag = ".fb-form form";
const fieldSettingsTemplate = "field_settings.mst";
const fieldSettingsContainer = "#fb-field-settings .settings-wrapper";
const formBuildingJSON = {
	"form_fields" : []
};

export default function formBuilder(opts){
	readTemplate("template.mst").then( template => {
		generateHTML(template, opts, opts.element);
		initDrag()
		/*initDrop()*/ 
		initSortable()
		

	} ).catch(e => console.error(e))
}

export let readJSON = async (file) => $.get(`${jsonPath}/${file}`)

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
	    stop: function(event, ui){
	    	setTimeout(()=>{
	    		$(formTag).empty();
	    		afterDrop(event, ui);
	    	}, 1000)
	    }
	})
}
let initSortable = () => {
	$( ".droppable" ).sortable({
		revert: true
		//update: afterDrop
	});
}

let afterDrop = (event, ui) => {
	//let fieldID = ui.item.attr("data-id")
	let fieldID = $(event.target).attr("data-id")
	getFieldData(fieldID).then(fieldData => {
		fieldData[0].field.field_id = Date.now();
		formBuildingJSON.form_fields.push(fieldData[0]);
		appendFieldsMarkup()
		setTimeout(()=>selectField(fieldData[0].field.field_id), 100)
	})
	$(ui.helper[0]).remove()
}

let initFlatpicker = () => $("#date").flatpickr();

let appendFieldsMarkup = () => {
	let data = jQuery.extend(true, {}, formBuildingJSON);
	data.form_fields.forEach( i => {
		let obj = {};
		obj.wrapperTag = i.field.wrapper.tag;
		//obj.field_id = (i.field.field_id) ? i.field.wrapper.attr.push({"id":i.field.field_id}) : ""; 
		i.field.wrapper.attr = (i.field.field_id) ? addAttr(i.field.wrapper.attr, "id", i.field.field_id) : ""; 
		let visibility = (i.field.visibility === "s") ? true : false;
		i.field.wrapper.attr = (!visibility) ? addAttr(i.field.wrapper.attr, "class", "fb-hidden") : i.field.wrapper.attr;
		obj.wrapperAttributes = generateTagAttributes(i.field.wrapper.attr)
		obj.label = i.field.label.text;
		obj.tooltip = (i.field.tooltip) ? i.field.tooltip : false;
		obj.label_placement = i.field.label.label_placement;
		obj.inputTag = (i.field.input && i.field.input.tag) ? i.field.input.tag : "";
		obj.inputAttributes = (i.field.input && i.field.input.attr) ? generateTagAttributes(i.field.input.attr) : "";
		obj.choices = (i.field.input && i.field.input.options) ? i.field.input.options : "";
		obj.label_attributes = (i.field.label.attr) ? generateTagAttributes(i.field.label.attr) : "";
		if(i.field.id == 8) obj.address_fields = (i.field.address_fields) ? createMultiFieldObj(i.field.address_fields) : ""; 
		if(i.field.id == 9) obj.name_fields = (i.field.name_fields) ? createMultiFieldObj(i.field.name_fields) : ""; 
		readTemplate(`inputs/${i.field.field_name}.mst`).then( template => {
			generateHTML(template, obj, formTag)
			obj = {};
			i.field.id == 7 && initFlatpicker()
		} ).catch(e => console.error(e))
	} );
}
let createMultiFieldObj = (data) => {
	let arr = [];
	for(let key in data){
		data.hasOwnProperty(key) && data[key].set && arr.push(data[key])
	}
	arr.forEach(i=>{
		i.attr = generateTagAttributes(i.attr);
	})
	return arr;
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
	console.log(id);
	$(formTag).find(".form-field").removeClass("fb-selected").click(function(){
		id = $(this).attr('id');
		$(formTag).find(".form-field").removeClass("fb-selected")
		$(formTag).find(`#${id}`).addClass("fb-selected", 800)
		onFieldSelect(id)
		$(fieldSettingsContainer).empty();
	})
	$(formTag).find(`#${id}`).addClass("fb-selected")
	onFieldSelect(id)
	$(fieldSettingsContainer).empty();
}

let getFieldSettingsObject = (id) => {
	let data = jQuery.extend(true, {}, formBuildingJSON);
	data = data.form_fields.filter( i => parseInt(i.field.field_id) === parseInt(id) )[0].field;
	let field = {};
	field.type = data.field_name;
	field.label = data.label.text;
	field.tooltip = (data.tooltip) ? data.tooltip : false;
	let required = data.input.attr.filter(i => (i.required) && i.required)
	field.required = (required.length) ? required[0].required : false 
	field.visibility = (data.visibility === "s") ? true : false;
	field.conditional_logic = (data.conditional_logic.set) ? data.conditional_logic : false;
	return field;
}

let onFieldSelect = (id) => {
	let data = getFieldSettingsObject(id);
	console.log(data);
	readTemplate(fieldSettingsTemplate).then( template => {
		generateHTML(template, data, fieldSettingsContainer)
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
	console.log(attr)
	return attr
}


let ifKeyExist = ( arr, key ) => (arr.find(v => v[ key ])) ? true : false;