$(function() {

	var editId = 0;
	var commentPostId = 0;
	var offset = 0;
	var limit = 11;
	var ajaxDone = true;
	var morePages = true;
	var uploads = [];
	
	initUpload();
	
	$(window).scroll(scrolled);
	$("#add-post").click(showAddPost);
	$("#cancel-post-button").click(removeAddPost);
	$("#save-post-button").click(savePosts);
	$("#delete-post-button").click(deletePost);
	$("#cancel-comment").click(closeAddComment);
	$("#save-comment").click(saveComment);
	$("#search").bind("search", searchKey);
	
	$("main").on("click", ".editable", showEditPost);
	$("main").on("click", ".comment-editable", showEditComment);
	$("main").on("click", ".comment-icon", showAddComment);
	$("main").on("click", ".comment-count", getComments);
	$("main").on("click", "#delete-comment", deleteComment);
	
	getPosts();
	
	function initUpload() {
		var dzDiv = $("#upload");
		dzDiv.addClass("dropzone");
		var dz = new Dropzone("#upload", {
			paramName : "files",
			url : "/uploads"
		});
		dz.on("success", uploadComplete);
		dz.on("error", function(file, msg) {
			alert(msg);
		});
	}
	
	function uploadComplete(event, response) {
		console.log(response);
		uploads.push(response);
	}
	
	function scrolled() {
		if (ajaxDone && morePages) {
			var size = $("main").height();
			var height = $(this).height();
			var top = $(this).scrollTop();
			console.log("size, height, top:", size, height, top);	
			if (top >= size - height) {
				console.log("size - height:", size - height);
				offset += limit;
				console.log("offset:", offset);
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
		$.ajax({
			url,
			method: "get",
			type: "json",
			data,
			error: function() {
				ajaxDone = true;
				ajaxError();
			},
			success: function(data) {
				ajaxDone = true;
				if ( data.length < limit) {
					morePages = false;
				}
				buildPosts(data);
			}
		});
	}
	
	function getComments() {
	
		var postId = $(this).parent().parent().find(".editable").data("id");
		var $commentTemplate = $(this).parent().parent().find(".comment-template");		
		
		$.ajax({
			url: "/get-comments",
			method: "get",
			type: "json",
			data: { postId },
			error: ajaxError,
			success: function(data) {
				//console.log(data);				
				buildComments(data, $commentTemplate);
			}
		});
	}
	
	function savePosts() {
		
		var $div = $("<div>");
		var $images = $("<p></p>");
		
		for (var i = 0; i < uploads.length; i++) {
			var $a = $("<a/>");
			$a.attr("href", uploads[i].file);
			$img = $("<img/>");
			$img.attr("src", uploads[i].thumbnail);
			$a.append($img);
			$images.append($a);			
		}
		$div.append($images);
		uploads = [];
		console.log("editId", editId);
		$.ajax({
			url: "/save-post",
			method: "post",
			type: "json",
			data: {
				content: $("#create-post-popup textarea").val() + $div.html(),
				id: editId
			},
			error: ajaxError,
			success: function() {
				reloadPosts();
			}
		});
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
				//console.log(data);
				$("#add-comment-popup").hide();
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
	
	function resetPost() {
		editId = 0;
		$("#create-post-popup textarea").val("");		
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
	
	function reloadPosts() {	
		removeAddPost();
		$(".post").remove();
		offset = 0;
		ajaxDone = false;
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