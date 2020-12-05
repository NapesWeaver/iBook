package com.example.iBook.pojo;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SecondaryTable;
import javax.persistence.Table;
import javax.persistence.Transient;

@Entity
@Table(name="posts")
@SecondaryTable(name="post_comments")
public class Post {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name="posts_id")
	private int id;
	
	@ManyToOne
	@JoinColumn(name="posts_user_id", nullable=false)
	private User user;
	
	@Column(name="posts_content")
	private String content;
	
	@Column(name="posts_date")
	private Date date;
	
	@Transient
	private boolean editable;
	
	@Column(name="comment_count", table="post_comments", insertable=false, updatable=false)
	private Integer commentCount;
	
	//@Transient
	//private int commentCount;
	
	public int getId() {
		return id;
	}
	
	public void setId(int id) {
		this.id = id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public boolean isEditable() {
		return editable;
	}

	public void setEditable(boolean editable) {
		this.editable = editable;
	}
	
	public Integer getCommentCount() {
		return commentCount;
	}
	
	/*public int getCommentCount() {
		return commentCount;
	}*/
	
	public void setCommentCount(int commentCount) {
		this.commentCount = commentCount;
	}
}
