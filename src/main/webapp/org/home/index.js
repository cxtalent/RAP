$(function () {
    //$(".content").html('group here');
    //$.get($.route('org.home.projects'), function(data) {
    //  console.log(data.isOk);
    //}, 'JSON');

    if (!-[1,]) { // IE 6-8
        $('#browserCheckAlert').show();
    }

    var NAME_MAP = {
        'user': '�ҵ���Ŀ',
        'star': '��Ҫ��Ŀ',
        'heart': '�ҹ�ע����Ŀ',
        'tag': '�Ҽ������Ŀ'
    };

    var PL_ID = null;
    var CORP_ID = null;

    function handleAddClick() {
        var that = this;
        var btn = $(this);
        if (btn.data('shown')) {
            return;
        }
        btn.data('shown', 1);
        var teamId = 0;
        var groupId = $(this).data('groupid');

        $.confirm({
            content: $.render($('#create-proj-tmpl').text(), {}),
            title: '������Ŀ',
            confirmText: 'ȷ�ϴ���',
            cancelCallback: function () {
                btn.data('shown', 0);
            },
            showCallback: function () {
                var box = $(this);
                btn.data('shown', 0);
                var that = this;
                box.find('input[type=text]').focus();
                box.find('.picking-user').delegate('.unpick-btn', 'click', function () {
                    box.parent('.picked-user').remove();
                });
                $('.tip').tooltip();
                $('.project-target .team').change(function () {
                    var corpId = $(this).val();
                    if (corpId === '') {
                        CORP_ID = '';
                        $('.create-new-entity-container').html('');
                        return;
                    }
                    var text = $(this).find('[value=' + corpId + ']').text();

                    fillSelectAsync('org.productline.all', {
                        corpId: corpId
                    }, $('#option-list-tmpl').text(), '.project-target .productline', function () {
                        teamId = corpId;
                        box.find('.disabled').removeClass('disabled');
                        box.find('.accounts-inputer').removeAttr('disabled');
                        showCreateProductlineBtn(corpId, text);
                    });
                });

                $('.project-target .productline').change(function () {
                    var plId = $(this).val();
                    if (!plId) {
                        PL_ID = '';
                        $('.create-new-entity-container').html('');
                        return;
                    }
                    var text = $(this).find('[value=' + plId + ']').text();
                    fillSelectAsync('org.home.grouplist', {
                        productlineId: plId
                    }, $('#option-list-tmpl').text(), '.project-target .group', function () {
                        showCreateGroupBtn(plId, text);
                    });
                });

                getUsers(function (users) {
                    $('.user-loading').hide();
                    $(that).find('.accounts-inputer').keyup(function () {
                        $.autocomplete(that, users);
                    }).focus(function () {
                        $.autocomplete(that, users);
                    });
                }, teamId);
            },
            confirmClicked: function () {
                var inputer = $(this).find('input[type=text]');
                if (inputer.val().trim() === '') {
                    inputer.addClass('shake');
                    inputer.focus();
                    setTimeout(function () {
                        inputer && inputer.removeClass('shake');
                    }, 1000);
                    return;
                }
                var grouper = $(this).find('.project-target .group');

                if (grouper.val().trim() === '') {
                    var parent = grouper.parents('.project-target');
                    parent.addClass('shake');
                    setTimeout(function () {
                        parent && parent.removeClass('shake');
                    }, 1000);
                    return;
                }

                var groupId = grouper.val();
                var tmpl = $('#create-proj-success-tmpl').text();
                var modal = $(this);
                var accounts = $(this).find('.picked-user');
                var values = [];
                for (var i = 0, l = accounts.length; i < l; i++) {
                    var current = $(accounts[i]);
                    values.push(current.data('account') + '(' + current.data('name') + ')');
                }
                $.post($.route('org.project.create'), {
                    groupId: groupId,
                    name: inputer.val(),
                    desc: $(this).find('textarea.desc').val(),
                    accounts: values.join(', ')
                }, function (data) {
                    data = data.result;
                    data.status = data.status || '�ոմ���';
                    var html = $.render(tmpl, data);
                    $(that).before(html);
                    modal.modal('hide');
                }, "JSON");
            }
        });
    }

    function handleViewProjectClick() {
        var box = $(this);
        box = box.parents('.box');
        var projId = box.data('projid');
        window.location = ($.route('workspace.mine') + '?projectId=' + projId);
    }

    function handleEditProjectClick() {
        var id = $(this).data('id');
        var box = $(this).parents('.box');
        var teamId = box.data('teamid');
        var name = box.find('.info .title').html();
        var desc = box.find('.info .intro').html();
        var accounts = box.find('.accounts-hidden').val();
        var splited = accounts.split(',');
        var pickeds = [];
        var reg = /(.+)\s*\(([^,]+)\)/;
        for (var i = 0, l = splited.length; i < l; i++) {
            var matched = reg.exec(splited[i]);
            if (matched) {
                pickeds.push({
                    name: matched[2],
                    account: matched[1]
                });
            }
        }
        $.confirm({
            content: $.render($('#update-proj-tmpl').text(), {
                name: name ? name.replace(/"/g, "") : "",
                desc: desc,
                users: pickeds
            }),
            title: '�޸���Ŀ',
            confirmText: 'ȷ���޸�',
            showCallback: function () {
                var that = this;
                $(this).find('input[type=text]').focus();
                $(this).find('.picking-user').delegate('.unpick-btn', 'click', function () {
                    $(this).parent('.picked-user').remove();
                });
                $('.tip').tooltip();
                getUsers(function (users) {
                    $('.user-loading').hide();
                    $(that).find('.accounts-inputer').keyup(function () {
                        $.autocomplete(that, users);
                    }).focus(function () {
                        $.autocomplete(that, users);
                    });
                }, teamId);
            },
            confirmClicked: function () {
                var inputer = $(this).find('input[type=text]');
                if (inputer.val().trim() === '') {
                    inputer.addClass('shake');
                    inputer.focus();
                    setTimeout(function () {
                        inputer && inputer.removeClass('shake');
                    }, 1000);
                    return;
                }
                var tmpl = $('#create-proj-success-tmpl').text();
                var modal = $(this);
                var accounts = $(this).find('.picked-user');
                var values = [];
                for (var i = 0, l = accounts.length; i < l; i++) {
                    var current = $(accounts[i]);
                    values.push(current.data('account') + '(' + current.data('name') + ')');
                }
                $.post($.route('org.project.update'), {
                    id: id,
                    name: inputer.val(),
                    desc: $(this).find('textarea.desc').val(),
                    accounts: values.join(', ')
                }, function (data) {
                    if (data.code != '200') {
                        modal.modal('hide');
                        alert(data.msg);
                        return;
                    }
                    data = data.result;
                    data.status = data.status || '�ոո���';
                    var html = $.render(tmpl, data);
                    box.replaceWith(html);
                    modal.modal('hide');
                }, "JSON");
            }
        });
    }

    function handleRapPluginClick() {
        var id = $(this).data('id');
        var url = '';
        var host = location && location.host ? location.host : '/';
        $.message({
            content: '<input type="text" id="rap-plugin-inputer" disabled="disabled" class="form-control" value="<script src=\'http://' + host + '/rap.plugin.js?projectId=' + id + '\'></script>" />',
            title: '����RAP�����ַ',
            showCallback: function () {
                var ele = $('#rap-plugin-inputer')[0];
                ele.focus();
                ele.selectionEnd = ele.value.length;
            }
        });
    }

    function handleCreateProductline() {
        $.confirm({
            content: $.render($('#create-productline').text(), {}),
            title: '��Ӳ�Ʒ��',
            confirmText: 'ȷ��',
            showCallback: function () {
                $(this).find('input[type=text]').focus();
            },
            confirmClicked: function () {
                var inputer = $(this).find('input[type=text]');
                if (inputer.val().trim() === '') {
                    inputer.addClass('shake');
                    inputer.focus();
                    setTimeout(function () {
                        inputer && inputer.removeClass('shake');
                    }, 1000);
                    return;
                }
                var modal = $(this);
                var value = inputer.val().trim();
                $.post($.route('org.productline.create'), {
                    corpId: CORP_ID,
                    name: value
                }, function (data) {
                    var productlines = data.items;
                    if (!productlines) {
                        alert('����ʧ�ܣ����Ժ�����');
                        return;
                    }
                    var pl = productlines[0];
                    showCreateGroupBtn(pl.id, pl.name);
                    resetGroupSelect();
                    var select = appendOptions('.project-target .productline', pl.id, pl.name);
                    setTimeout(function () {
                        select.find('[value=""]').text('--��ѡ��--');
                        select.val(pl.id);
                    }, 100);
                    modal.modal('hide');
                }, "JSON");
            }
        });
    }

    function appendOptions(selector, value, text) {
        return $(selector).append('<option value="' + value + '">' + text + '</option>');
    }

    function showCreateGroupBtn(id, name) {
        PL_ID = id;
        $('.create-new-entity-container').hide().html(
            '<div class="create-group btn btn-default" style="margin-top: 10px;">Ϊ ��' + name + '�� ��Ʒ�ߴ����·���</div>').slideDown();
    }

    function showCreateProductlineBtn(id, name) {
        CORP_ID = id;
        $('.create-new-entity-container').hide().html(
            '<div class="create-productline btn btn-default" style="margin-top: 10px;">Ϊ ��' + name + '�� �����²�Ʒ��</div>').slideDown();
    }

    function resetGroupSelect() {
        $('.project-target .group').html('<option>--��ѡ�����--</option>');
    }

    function handleCreateGroup() {
        $.confirm({
            content: $('#create-group-tmpl').text(),
            title: '��������',
            confirmText: 'ȷ�ϴ���',
            showCallback: function () {
                $(this).find('input[type=text]').focus();
            },
            confirmClicked: function () {
                var tmpl = $('#group-tmpl').text();
                var inputer = $(this).find('input[type=text]');
                if (inputer.val().trim() === '') {
                    inputer.addClass('shake');
                    inputer.focus();
                    setTimeout(function () {
                        inputer && inputer.removeClass('shake');
                    }, 1000);
                    return;
                }
                var modal = $(this);
                $.post($.route('org.group.create'), {
                    productlineId: PL_ID,
                    name: inputer.val().trim()
                }, function (data) {
                    var groups = data.groups;
                    if (!groups) {
                        alert('����ʧ�ܣ����Ժ�����');
                        return;
                    }
                    var group = groups[0];
                    var select = $('.project-target .group').append('<option value="' + group.id + '">' + group.name + '</option>');
                    setTimeout(function () {
                        select.find('[value=""]').text('--��ѡ��--');
                        select.val(group.id);
                    }, 100);
                    modal.modal('hide');
                }, "JSON");
            }
        });
    }

    function handleDeleteClick() {
        var id = $(this).data('id');
        var box = $(this).parents('.box');
        $.confirm({
            content: 'ɾ���Ժ󲻿ɻָ������������',
            title: 'ɾ����Ŀ',
            confirmText: 'ȷ��ɾ��',
            confirmClicked: function () {
                var modal = $(this);
                $.post($.route('org.project.delete'), {
                    id: id
                }, function (data) {
                    if (data.code == '200') {
                        box.hide('slow', function () {
                            box.remove();
                        });
                    } else {
                        alert(data.msg);
                    }
                    modal.modal('hide');
                }, "JSON");
            }
        });
    }

    function bindEvents() {
        $('body')
            .delegate('.box .info, .box .tools .glyphicon-eye-open', 'click', handleViewProjectClick)
            .delegate('.box-to-add', 'click', handleAddClick)
            .delegate('.box .glyphicon-pencil', 'click', handleEditProjectClick)
            .delegate('.box .glyphicon-export', 'click', handleRapPluginClick)
            .delegate('.create-productline', 'click', handleCreateProductline)
            .delegate('.create-group', 'click', handleCreateGroup)
            .delegate('.box .glyphicon-trash', 'click', handleDeleteClick);
    }

    function fillSelectAsync(route, params, tmpl, target, callback) {
        callback && callback();
        $(target).html($.render(tmpl, {
            items: [{id: '', name: '������...'}]
        }));
        $.get($.route(route), params, function (data) {
            if (data.groups) {
                data.items = data.groups;
            }
            if (data.items.length === 0) {
                data.items = [{id: '', name: '--�޲�ѯ���--'}];
            } else {
                data.items.unshift({id: '', name: '--��ѡ��--'});
            }

            var html = $.render(tmpl, data);
            $(target).html(html);
        }, "JSON");
    }

    function bindSearchEvents() {
        var con = $('.project-autocomplete-con'),
            ul = $('.project-autocomplete-con ul');

        function handler(e) {
            var code = e.keyCode;
            if (code == 38 || code == 40) {
                return;
            }
            var jqThis = $(this),
                old = jqThis.data('oldValue'),
                val = jqThis.val().trim();
            if (old && old === val) {
                con.show();
                jqThis.data('searching', 0);
                return;
            }
            if (old) {
                jqThis.removeData('oldValue');
            }
            if (!jqThis.val().trim()) {
                con.hide();
                jqThis.data('searching', 0);
                return;
            }
            if (jqThis.data('searching')) {
                return;
            }
            jqThis.data('searching', 1);

            $.post($.route('org.project.search'), {key: val}, function (data) {
                if (!jqThis.data('searching')) {
                    // ���ܷ���;�У����Ѿ�����Ҫ��������ˣ����磺�����input
                    return;
                }
                jqThis.data('searching', 0);
                if (data && data.length === 0) {
                    data = [{id: '-1', name: 'û���ҵ� "' + val + '" ��Ӧ����Ŀ��o(�s���t)o'}];
                }
                ul.html($.render($('#project-autocomplete-li').text(), {
                    projects: data
                }));
                con.show();
            }, 'JSON');
        }

        var inputer = $('.project-search-inputer'), prev;
        ul.delegate('li', 'mouseenter', function () {
            prev && prev.removeClass('active');
            prev = $(this).addClass('active');
        }).delegate('li', 'mouseleave', function () {
            $(this).removeClass('active');
        });
        inputer.focus(handler).keyup(handler).blur(function () {
            var jqThis = $(this), val = jqThis.val().trim();
            if (val) {
                jqThis.data('oldValue', val);
            }
            setTimeout(function () {
                con.hide();
            }, 300);
        }).keydown(function (e) {
            var code = e.keyCode;
            var active;
            var node;
            if (code == 38) {
                e.preventDefault();
                active = ul.children().index(ul.find('.active'));
                node = null;
                if (active === -1 || active === 0) {
                    node = ul.children().last();
                } else {
                    node = $(ul.children()[active - 1]);
                }
                if (prev) {
                    prev.removeClass('active');
                }
                node.addClass('active');
                prev = node;
            } else if (code == 40) {
                e.preventDefault();
                active = ul.children().index(ul.find('.active'));
                node = null;
                if (active == -1 || active == ul.children().length - 1) {
                    node = ul.children().first();
                } else {
                    node = $(ul.children()[active + 1]);
                }
                if (prev) {
                    prev.removeClass('active');
                }
                node.addClass('active');
                prev = node;
            } else if (code == 27) {
                con.hide();
                inputer.blur();
            } else if (code == 13) {
                if (prev) {
                    var id = prev.data('id');
                    if (id == '-1') {
                        return;
                    }
                    window.location.href = '/workspace/myWorkspace.action?projectId=' + id;
                }
            }
        });
        con.delegate('li', 'click', function () {
            var jqThis = $(this);
            var id = jqThis.data('id');
            if (id == '-1') {
                return;
            }
            window.location.href = '/workspace/myWorkspace.action?projectId=' + id;
        });
    }

    function render() {
        var tmpl = $('#group-tmpl').text();
        $.get($.route('org.home.projects'), {}, function (data) {
            var newGroup = [];
            for (var i = 0, l = data.groups.length; i < l; i++) {
                if (data.groups[i].type == 'user') {
                    var group = data.groups[i];
                    for (var j = 0; j < group.projects.length; j++) {
                        if (group.projects[j].related) {
                            newGroup.push(group.projects[j]);
                            group.projects.splice(j, 1);
                            j--;
                        }
                    }
                }
            }
            data.groups.push({
                type: 'tag',
                projects: newGroup
            });
            data.groups.forEach(function (group) {
                group.name = NAME_MAP[group.type] || '����';
            });
            var html = $.render(tmpl, data);
            $(".groups").html(html);

            bindEvents();
            bindSearchEvents();
        }, "JSON");
    }

    render();
    $('.tip').tooltip();

});
