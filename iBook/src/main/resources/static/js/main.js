$(function() {

	var editId = 0;
	var commentPostId = 0;
	var offset = 0;
	var limit = 6;
	var ajaxDone = true;
	var morePages = true;
	
	$(window).scroll(scrolled);
	$("#add-post").click(showAddPost);
	$("#cancel-post-button").click(removeAddPost);
	$("#save-post-button").click(savePosts);
	$("#delete-post-button").click(deletePost);
	$("#cancel-comment").click(closeAddComment);
	$("#save-comment").click(saveComment);
	//$("#search").keypress(searchKey);
	$("#search").bind("search", searchKey);
	$("main").on("click", ".editable", showEditPost);
	$("main").on("click", ".comment-editable", showEditComment);
	$("main").on("click", ".comment-icon", showAddComment);
	$("main").on("click", ".comment-count", getComments);
	$("main").on("click", "#delete-comment", deleteComment);
	
	getPosts();
	
	function scrolled() {
		if (ajaxDone && morePages) {
			var size = $("body").height();
			var height = $(this).height();
			var top = $(this).scrollTop();
			//console.log(size, height, top);	
			if (top >= size - height) {
				console.log(size - height);
				offset += limit;
				console.log(offset);
				getPosts();
			}			
		}
	}
	
	function searchKey() {
		offset = 0;
		ajaxDone = false;
		var text = $("#search").val();
		//if (event.which == 13) {
			$.ajax({
				url: "/search-posts",
				method: "get",
				dataType: "json",
				data: {
					text: text,
					limit: limit,
					offset: offset
				},
				error: function() {
					ajaxDone = true;
					ajaxError();
				},
				success: function(data) {
					//showSearchResults(data);
					ajaxDone = true;
					if (data.length < limit) {
						morePages = false;
					}
					offset = 0;
					morePages = true;	
					showSearchResults(data);				
				}
			});
		//}
	}
	
	function showSearchResults(data) {
		offset = 0;
		$(".post").remove();
		buildPosts(data);
	}
	
	function saveComment() {
		var content = $("#add-comment-popup textarea").val();		
		$.ajax({
	
			url: "/save-comment",
			method: "post",
			type: "json",
			data: {
				content: content,
				id: editId,
				postId: commentPostId
			},
			error: ajaxError,
			success: function(data) {
				console.log(data);
				$("#add-comment-popup").hide();
				reloadPosts();
			}
		});
	}
	
	function getPosts() {
		ajaxDone = false;
		var text = $("#search").val();
		var url = "/get-posts";
		var data = {
			limit: limit,
			offset: offset
		};
		if (text != "") {
			url = "/search-posts";
			data.text = text;
		}
		//console.log("offset:", offset);
		$.ajax({
			url,
			method: "get",
			type: "json",
			data,
			error: function(data) {
				ajaxDone = true;
				ajaxError();
			},
			success: function(data) {
				ajaxDone = true;
				if ( data.length < limit) {
					morePages = false;
				}
				//offset = 0;
				buildPosts(data);
			}
		});
	}
	
	function savePosts() {
	
		var content = $("#create-post-popup textarea").val();
		
		$.ajax({
			url: "/save-post",
			method: "post",
			type: "json",
			data: {
				content: content,
				id: editId
			},
			error: ajaxError,
			success: function() {
				reloadPosts();
			}
		});
	}
	
	function deletePost() {
	
		$.ajax({
			url: "/delete-post",
			method: "get",
			type: "json",
			data: { id: editId },
			error: ajaxError,
			success: function () {
				reloadPosts();
			}
		});
	}
	
	function deleteComment() {
		
		$.ajax({
			url: "/delete-comment",
			method: "get",
			type: "json",
			data: { id: editId },
			error: ajaxError,
			success: function () {
				$("#add-comment-popup").hide();
				$("#add-comment-popup textarea").val("");
				reloadPosts();
			}
		});
	}
	
	function getComments() {
	
		var postId = $(this).parent().parent().find(".editable").data("id");
		var $commentTemplate = $(this).parent().parent().find(".comment-template");
		
		console.log("postId: " + postId);
		
		$.ajax({
			url: "/get-comments",
			method: "get",
			type: "json",
			data: { postId },
			error: ajaxError,
			success: function(data) {
				console.log(data);				
				buildComments(data, $commentTemplate);
			}
		});
	}
	
	function ajaxError() {
		alert("AJAX ERROR!");
	}	
	
	function showAddPost() {
		$("#delete-post-button").hide();
		resetPost();
		$("#create-post-popup").addClass("show-add-popup");
		$("main").addClass("main-add-popup");		
	}
	
	function removeAddPost() {
		$("#create-post-popup").removeClass("show-add-popup");
		$("main").removeClass("main-add-popup");
		resetPost();		
	}
	
	function showEditPost() {
		$("#delete-post-button").show();
		var text = $(this).parent().parent().find(".post-content").text();
		$("#create-post-popup textarea").val(text);
		$("#create-post-popup").addClass("show-add-popup");
		$("main").addClass("main-add-popup");
		var id = $(this).data("id");
		editId = id;
	}
	
	function resetPost() {
		editId = 0;
		$("#create-post-popup textarea").val("");		
	}
	
	function reloadPosts() {	
		removeAddPost();
		offset = 0;
		$(".post").remove();
		getPosts();
	}
	
	function showAddComment() {
		$(".comment-template").empty();
		$("#delete-comment").hide();
		$("#add-comment-popup textarea").val("");
		editId = 0;
		commentPostId = $(this).parent().parent().find(".editable").data("id");
		var $popup = $("#add-comment-popup").detach();
		$(this).parent().parent().after($popup);
		$popup.show();
	}
	
	function showEditComment() {
		var text = $(this).parent().text().trim();
		var id = $(this).data("id");
		$("#delete-comment").show();
		editId = id;
		$("#add-comment-popup textarea").val(text);
		commentPostId = $(this).parent().parent().find(".comment-editable").data("id");
		var $popup = $("#add-comment-popup").detach();
		$(this).parent().parent().after($popup);
		$popup.show();
		console.log("commentPostId: " + commentPostId);
	}
	
	function closeAddComment() {
		$(this).parent().hide();
		$("#add-comment-popup textarea").val("");
	}
	
	function buildPosts(data) {
		console.log(data);
		
		for (var i = 0; i < data.length; i++) {
			var $post = $("#post-template").clone();
			$post.removeAttr("id");
			$post.addClass("post");			
			$post.find(".user-name").append(data[i].user.name);
			$post.find(".post-content").append(data[i].content);
			
			if (!data[i].editable) {
				$post.find(".editable").hide();
			}			
			$post.find(".editable").data("id", data[i].id);// Wow !!!
			$post.find(".comment-count").append(data[i].commentCount + " comments");			
			$("main").append($post);
		}
	}
	
	function buildComments(data, $commentTemplate) {
		
		$commentTemplate.parent().find(".comment").remove();
		
		for (var i = 0; i < data.length; i++) {
			var $comment = $commentTemplate.clone();
			$comment.removeClass("comment-template");
			$comment.addClass("comment");
			$comment.append(data[i].text);
			
			if (data[i].editable) {
				$comment.append("<i class='far fa-edit comment-editable'></i>");
			}
			$comment.find(".comment-editable").data("id", data[i].id);// Wow !!!
			$commentTemplate.parent().append($comment);
		}
	}
});