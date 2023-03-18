// Copyright (c) 2021, Youssef Restom and contributors
// For license information, please see license.txt

frappe.ui.form.on('POS Offer', {
	setup: function (frm) {
		set_filters(frm);
		controllers(frm);
	},
	refresh: function (frm) {
		controllers(frm);
	},
	onload: function (frm) {
		set_filters(frm);
		controllers(frm);
	},
	validate: function (frm) {
		if (frm.doc.apply_on === 'Transaction') {
			if (!frm.doc.min_amt > 0) {
				frappe.throw("Min Amount most be more then zero");
			}
		}
		if (frm.doc.offer === 'Give Product') {
			if (!frm.doc.given_qty > 0) {
				frappe.throw("Given Quantity most be more then zero");
			}
		}
		if (frm.doc.offer === 'Loyalty Point') {
			if (!frm.doc.loyalty_points > 0) {
				frappe.throw("Loyalty Points most be more then zero");
			}
		}
		if (frm.doc.apply_type === 'Item Group' && frm.doc.offer === 'Give Product' && !frm.doc.replace_item && !frm.doc.replace_cheapest_item) {
			frm.set_value('auto', 0);
		}
	},
	apply_on: function (frm) {
		controllers(frm);
	},
	offer: function (frm) {
		controllers(frm);
	},
	apply_type: function (frm) {
		controllers(frm);
	},
	discount_type: function (frm) {
		controllers(frm);
	},
	replace_item: function (frm) {
		controllers(frm);
	},
	replace_cheapest_item: function (frm) {
		controllers(frm);
	},
	create_same_offer_for_other_companies: async function(frm) {
		let suggested_offer_names = await frappe.call(
			{
				method: "posawesome.api.get_companies_pos_offers_names",
				args: {
					offer_name: "Test",
					exclude_company: frm.doc.company
				}
			}
		);
		suggested_offer_names = suggested_offer_names.message;
		
		let d = new frappe.ui.Dialog({
			title: __('Create This POS Offers for Multi Companies'),
			fields: [
				{
					label: 'From Offer',
					fieldname: 'pos_offer',
					fieldtype: 'Link',
					default: frm.doc.name,
					options: 'POS Offer',
					read_only: 1
				},
				{
					label: __('For Companies'),
					fieldname: 'for_companies',
					fieldtype: 'Table',
					data: [],
					fields: [
						{ fieldname: 'company', fieldtype: 'Link', in_list_view: 1, label: 'Company', read_only: 1, options: 'Company' },
						{ fieldname: 'suggested_offer_name', fieldtype: 'Data', in_list_view: 1, label: 'Suggested Offer Name' }
					]
				}
			],
			primary_action_label: 'Create POS Offers',
			primary_action(values) {
				frappe.call(
					{
						method: 'posawesome.api.make_multi_company_pos_offers',
						args: { 
							current_pos_offer_name: frm.doc.name,
							for_companies: values.for_companies
						},
						callback: function (r) {
							let res = r.message;

							if(res) {
								frappe.show_alert(res.data);
							}
							if(res.status === "success") {
								d.hide();
							}
						}
					}
				)
				// d.hide();
			}
		});
		
		d.show();

		suggested_offer_names.forEach(sugg => {
			console.log(sugg);
			d.fields_dict.for_companies.df.data.push(
				{
					company: sugg.company,
					suggested_offer_name: sugg.suggested_offer_name
				}
			)
		})

		d.fields_dict.for_companies.grid.refresh();
		console.log(d.fields_dict.for_companies.df.data);

	}
});


const controllers = (frm) => {
	console.info("controllers");
	frm.toggle_display('item', frm.doc.apply_on === 'Item Code');
	frm.toggle_reqd('item', frm.doc.apply_on === 'Item Code');

	frm.toggle_display('item_group', frm.doc.apply_on === 'Item Group');
	frm.toggle_reqd('item_group', frm.doc.apply_on === 'Item Group');

	frm.toggle_display('brand', frm.doc.apply_on === 'Brand');
	frm.toggle_reqd('brand', frm.doc.apply_on === 'Brand');

	frm.toggle_reqd('min_amt', frm.doc.apply_on === 'Transaction');

	frm.toggle_display('apply_for_section', frm.doc.offer === 'Give Product');
	frm.toggle_reqd('apply_type', frm.doc.offer === 'Give Product');

	frm.toggle_display('replace_item', frm.doc.apply_on === 'Item Code' && frm.doc.offer === 'Give Product' && frm.doc.apply_type === 'Item Code');
	frm.toggle_display('replace_cheapest_item', frm.doc.apply_on === 'Item Group' && frm.doc.offer === 'Give Product' && frm.doc.apply_type === 'Item Group');

	frm.toggle_display('apply_item_code', frm.doc.apply_type === 'Item Code' && !frm.doc.replace_item);
	frm.toggle_reqd('apply_item_code', frm.doc.apply_type === 'Item Code' && !frm.doc.replace_item);

	frm.toggle_display('apply_item_group', frm.doc.apply_type === 'Item Group' && !frm.doc.replace_cheapest_item);
	frm.toggle_reqd('apply_item_group', frm.doc.apply_type === 'Item Group' && !frm.doc.replace_cheapest_item);

	frm.toggle_display('less_then', frm.doc.apply_type === 'Item Group' && !frm.doc.replace_cheapest_item);

	frm.toggle_display('product_discount_scheme_section', frm.doc.offer === 'Give Product');
	frm.toggle_display('given_qty', frm.doc.offer === 'Give Product');
	frm.toggle_reqd('given_qty', frm.doc.offer === 'Give Product');

	frm.toggle_display('price_discount_scheme_section', frm.doc.offer !== 'Loyalty Point');
	frm.toggle_display('discount_type', frm.doc.offer !== 'Loyalty Point');
	frm.toggle_reqd('discount_type', frm.doc.offer !== 'Loyalty Point');

	frm.toggle_display('rate', frm.doc.discount_type === 'Rate');
	frm.toggle_reqd('rate', frm.doc.discount_type === 'Rate');

	frm.toggle_display('discount_amount', frm.doc.discount_type === 'Discount Amount');
	frm.toggle_reqd('discount_amount', frm.doc.discount_type === 'Discount Amount');

	frm.toggle_display('discount_percentage', frm.doc.discount_type === 'Discount Percentage');
	frm.toggle_reqd('discount_percentage', frm.doc.discount_type === 'Discount Percentage');

	frm.toggle_display('loyalty_point_scheme_section', frm.doc.offer === 'Loyalty Point');
	frm.toggle_display('loyalty_program', frm.doc.offer === 'Loyalty Point');
	frm.toggle_reqd('loyalty_program', frm.doc.offer === 'Loyalty Point');

	frm.toggle_display('loyalty_points', frm.doc.offer === 'Loyalty Point');
	frm.toggle_reqd('loyalty_points', frm.doc.offer === 'Loyalty Point');

	if (frm.doc.offer === 'Grand Total') {
		if(frm.doc.discount_type === "Based On Cheapest Select Items (1:1)") {
			frm.set_df_property('discount_type', 'description', `
			Example:
			- If item selected with the following prices and odd number quantity (10, 15, 20 USD) discount will be 10 USD.
			- If item selected with the following prices and even number quantity (10, 15, 20, 25 USD) discount will be 25 USD (10+15).
			`);	
		} else {
			frm.set_df_property('discount_type', 'description', '');	
		}
		frm.set_df_property('discount_type', 'options', ['Discount Percentage', 'Based On Cheapest Select Items (1:1)']);
	} else {
		frm.set_df_property('discount_type', 'options', ['', 'Rate', 'Discount Percentage', 'Discount Amount']);
		frm.set_df_property('discount_type', 'description', '');
	}

	if (frm.doc.apply_on === 'Transaction') {
		frm.set_df_property('offer', 'options', ['', 'Give Product', 'Grand Total', 'Loyalty Point']);
	} else {
		frm.set_df_property('offer', 'options', ['', 'Item Price', 'Give Product', 'Grand Total', 'Loyalty Point']);
	}

	if (frm.doc.apply_type === 'Item Group' && frm.doc.offer === 'Give Product' && !frm.doc.replace_item && !frm.doc.replace_cheapest_item) {
		frm.set_value('auto', 0);
	}
	if (frm.doc.apply_on !== 'Item Code' || frm.doc.offer !== 'Give Product' || frm.doc.apply_type !== 'Item Code') {
		frm.set_value('replace_item', 0);
	}
	if (frm.doc.apply_on !== 'Item Group' || frm.doc.offer !== 'Give Product' || frm.doc.apply_type !== 'Item Group') {
		frm.set_value('replace_cheapest_item', 0);
	}

};

const set_filters = (frm) => {
	frm.set_query('pos_profile', function () {
		return {
			filters: {
				'company': frm.doc.company,
			}
		};
	});
	frm.set_query('warehouse', function () {
		return {
			filters: {
				'company': frm.doc.company,
				'is_group': 0,
			}
		};
	});
	frm.set_query('loyalty_program', function () {
		return {
			filters: {
				'company': frm.doc.company,
			}
		};
	});
	frm.set_query('item_group', function () {
		return {
			filters: {
				'is_group': 0,
			}
		};
	});
	frm.set_query('apply_item_group', function () {
		return {
			filters: {
				'is_group': 0,
			}
		};
	});
};