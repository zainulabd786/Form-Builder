const jsonPath = "./json"
const templatePath = "./templates";
const formTag = ".fb-form form";
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
		connectToSortable: '.droppable',
		cursor: "crosshair",
		helper: "clone",
		opacity: 0.35,
		snap: true,
		refreshPositions: true
	})
}
let initSortable = () => {
	$( ".droppable" ).sortable({
		update: afterDrop
	});
}
let initFlatpicker = () => $("#date").flatpickr();

let afterDrop = (event, ui) => {
	let fieldID = ui.item.attr("data-id");
	ui.addClass("selected-zain")
	getFieldData(fieldID).then(fieldData => {
		fieldData[0].field.field_id = Date.now();
		formBuildingJSON.form_fields.push(fieldData[0]);
		appendFieldsMarkup()
	})
}
let appendFieldsMarkup = () => {
	let data = jQuery.extend(true, {}, formBuildingJSON);
	$(formTag).html("");
	data.form_fields.forEach( i => {
		let obj = {};
		obj.wrapperTag = i.field.wrapper.tag;
		obj.wrapperAttributes = generateTagAttributes(i.field.wrapper.attr)
		obj.label = i.field.label.text;
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
	/*if(data.street_address.set) arr.push(data.street_address)
	if(data.address_line_2.set) arr.push(data.address_line_2)
	if(data.city.set) arr.push(data.city)
	if(data.state.set) arr.push(data.state)
	if(data.zip.set) arr.push(data.zip)
	if(data.country.set) arr.push(data.country)
	if(data.first_name.set) arr.push(data.first_name)
	if(data.last_name.set) arr.push(data.last_name)*/
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
