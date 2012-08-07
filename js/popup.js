init();
//get all the group and show them in the list
function fillGroupList() {
	var groups = Group.getGroupArray();
	$('#groups').empty();
	for(var i = 0; i < groups.length; i++) {
		var val = groups[i];
		$("ul.template.groups-list").children().clone().appendTo('#groups').find('input[type=text]').val(val).data('oldname', val);
	}
}

function fillGroupedList(list, groupName, grouped) {
	if(list.length == 0)
		return;
	list.sort(createComparisonFunction('time'));
	var totaltime = Statistics2.gettimeingroup(list);
	$('ul.template.domain-list').children().clone().addClass(groupName).appendTo('#domain-list').find('span.group-name').text(groupName).end().find('span.group-time').text(formattime(totaltime));
	for(var i = 0; i < list.length; i++) {
		if(parseInt(list[i].time) > 0)
			$('ul.template.group-domain').children().clone().appendTo('#domain-list li.' + groupName + ' ul').find('span.domain-name').text(list[i].domain).end().find('span.domain-time').text(formattime(list[i].time));
		if(grouped != undefined)
			grouped[list[i].domain] = 1;
		else {
			if(list[i].time < 120 && i > 20)
				break;
		}
	}
}

function fillchecks() {
	var domaingroup = Group.getAllDomainGroups();
	$('#domain-list>li>ul>li').each(function(n) {
		var domainurl = $('span.domain-name', this).text();
		if(domaingroup[domainurl] && domaingroup[domainurl].length > 0)
			$('<span class="checks"/>').html('<span>' + domaingroup[domainurl].join(',') + '</span>').appendTo(this);
		else
			$('<span class="checks"/>').html('<span>未分组</span>').appendTo(this);
	});
}

function checkGroupName(val) {
	var p1 = /^[\u4e00-\u9fa5\w]+$/;
	if(p1.test(val.trim())) {
		val = val.trim();
		return val;
	}
	return '';
}

function showError(text) {
	$('#group div:first-child').append('<p class="error">' + text + '</p>');
}

function hideError() {
	$('#group div:first-child .error').remove();
}

$(function() {
	function tabs(container) {
	  $('li', $(container).children('ul')).click(function() {
	    var $a = $(this).find('a');
	    $(this).closest('ul').find('a').removeClass('active');
	    $a.addClass('active');
	    $(container).children('div').hide();
	    $($a.attr('href')).show();
	  });
	  $('li:eq(0)', $(container).children('ul')).click();
	}
	tabs($('#tabset'));
	//$('#tabset').tabs();
	fillGroupList();
	//create group
	$('[name="createbtn"]').click(function(event) {
		hideError();
		var val = checkGroupName($("[name='groupname']").val());
		if(val !== '' && val != "ungrouped" && Group.createGroup(val)) {
			$("ul.template.groups-list").children().clone().appendTo('#groups').find('input[type=text]').val(val).data('oldname', val);
			$('#time-selector select').change();
		} else if(val === '') {
			//showError('please do not input special chars.');
			showError('无效的输入');
		} else {
			//showError('group ' + val + ' exists');
			showError('分组 ' + val + ' 已经存在');
		}
	});
	$('[action-type="addGroup"]').live('click', function(event) {
	  $(this).closest('.group-checks').active = true;
	  $(this).closest('ul').find('div.quick_form').show();
	  $(this).hide();
	});
	//delete group
	$('.delete').live('click', function() {
		var unit = $(this).closest('li');
		var name = unit.find('[type=text]').val();
		unit.remove();
		Group.deleteGroup(name);
		$('#time-selector select').change();
	});
	//rename group
	$('button.rename').live('click', function() {
		hideError();
		var oldname = $(this).prev('[type=text]').data('oldname');
		var newname = checkGroupName($(this).prev('[type=text]').val().trim());
		if(newname !== '' && newname != 'ungrouped' && Group.renameGroup(oldname, newname)) {
			$(this).prev('[type=text]').data('oldname', newname);
		} else if(newname === '') {
			//showError('please do not input special chars.');
			showError('无效的输入');
		} else {
			//showError('group ' + newname + ' exists');
			showError('分组 ' + newname + ' 已存在');
		}
		fillGroupList();
		$('#time-selector select').change();
	});
	$('#time-selector select').change(function(event) {
		$('#domain-list').empty();
		var time = $(':selected', this).val();
		//var obj = jQuery.extend(true, {}, window.time_tracker);
		var groups = Group.getGroupArray(), grouped = {};

		for(var i = 0; i < groups.length; i++) {
			var list = Statistics2.get(time, groups[i]);
			fillGroupedList(list, groups[i], grouped);
		}

		var ungrouped = [];
		var all = Statistics2.get(time);
		for(var i = 0; i < all.length; i++)
		if(!grouped[all[i].domain])
			ungrouped.push(all[i]);
		ungrouped.sort();
		fillGroupedList(ungrouped, '未分组');
		//fillchecks();
	}).change();
	$('ul#domain-list>li>span.group-name').live('click', function(event) {
		$(this).nextAll('ul').toggle();
		if($(this).nextAll('ul').is(':hidden')) {
			$(this).removeClass('up-arrow');
			$(this).addClass('down-arrow');
		} else {
			$(this).removeClass('down-arrow');
			$(this).addClass('up-arrow');
		}
	});
	$('#domain-list>li>ul>li').live('mouseenter', function(event) {
		var groups = Group.getGroupArray();
		if(groups.length == 0)
			return;
		var text = $(this).text();
		var domainname = $('span.domain-name', this).text();
		$('div.template.group-checks').clone().removeClass('template').appendTo(this);
		for(var i = 0; i < groups.length; i++) {
			$('<li><input type="checkbox" /><label /></li>').appendTo('#domain-list div.group-checks .group-list').find('input[type=checkbox]').attr('id', domainname + '|' + groups[i]).attr('checked', Group.isDomainInGroup(domainname, groups[i]) ? true : false).end().find('label').text(groups[i]).attr('for', domainname + '|' + groups[i]);
		}
	}).live('mouseleave', function(event) {
	  if($(this).closest('.group-checks').active != true)
		  $('div.group-checks', this).remove();
	});
	$('div.group-checks').live('blur', function() {
	  $(this).remove();
	});
	$('#domain-list div.group-checks input[type=checkbox]').live('click', function(event) {
		event.stopPropagation();
		var domainname = this.id.split('|')[0], groupname = this.id.split('|')[1], currentgroup = $(this).closest('#domain-list>li').find('span.group-name').text();
		if(!this.checked) {
			Group.deleteDomainFromGroup(domainname, groupname);
		} else if(this.checked) {
			Group.addDomainToGroup(domainname, groupname);
		}

		$('#time-selector select').change();
	});
	$('button[name="sync"]').click(function() {
		$(this).addClass('loading');
		$(document).queue(function() {
			sync_data(function(result) {
				if(result) {
					$('<p id="info" class="info">sync successfully!</p>').hide().insertBefore('#domain-list').slideDown(300).delay(1000).slideUp(300);
					$('#time-selector select').change();
				} else {
					$('<p id="info" class="error">failed in sync, please sync sooner.</p>').hide().insertBefore('#domain-list').slideDown(300).delay(1000).slideUp(300);
				}
				$('button[name="sync"]').removeClass('loading');
				$(document).dequeue();
			});
		});
	});
});