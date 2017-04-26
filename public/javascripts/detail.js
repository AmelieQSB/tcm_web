/**
 * Created by Mesogene on 7/28/16.
 */
$(function () {
    $('.comment').click(function (e) {
        var target = $(this)
        var toId = target.data('tid')
        var commentId = target.data('cid')

        if ($('#toId').length > 0) {
            $('#toId').val(toId)
        }
        else {
            $('<input>').attr({
                type: 'hidden',
                id: 'toId',
                name: 'comment[tid]',
                value: toId
            }).appendTo('#commentFrom')
        }

        if ($('#commentId').length > 0) {
            $('#commentId').val(commentId)
        }
        else {
            $('<input>').attr({
                type: 'hidden',
                id: 'commentId',
                name: 'comment[cid]',
                value: commentId
            }).appendTo('#commentFrom')
        }
    })
})
