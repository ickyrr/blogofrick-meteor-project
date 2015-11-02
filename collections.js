BlogList = new Mongo.Collection('bloglist');


if(Meteor.isClient){ 
   
      myPagination = new Paginator(BlogList);

      var summernoteOptions = function() {
        return {
          airMode: true,
          airPopover: [
            ['style',['style']],
            ['color', ['color']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['supersub', ['superscript','subscript']],
            ['font', ['bold', 'italic', 'strikethrough', 'underline', 'clear']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture']],
            ['other',['help','hide']]
          ]
        }

      styleTags: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
}

      Template.addNewPost.rendered = function() {
         $('#summernote').summernote({
             height: 200,   // set editable area's height
             focus: true,    // set focus editable area after Initialize summernote
             disableDragAndDrop: false,
             summernoteOptions: summernoteOptions
         });
      }

      Template.editPost.rendered = function() {
         $('#summernote').summernote({
             height: 200,   // set editable area's height
             focus: true,    // set focus editable area after Initialize summernote
             disableDragAndDrop: false,
             summernoteOptions: summernoteOptions
             
         });
      }

      Template.addNewPost.events({
        'submit .newPostForm': function(event){
           event.preventDefault();
           var postTitle = event.target.postTitle.value;
           var postContent = $('#summernote').code();
           var categories = event.target.categories.value;
           var currentUser = Meteor.userId();
           var author= Meteor.user().username

            Meteor.call('addNewPostData',postTitle,postContent,categories,author);

          event.target.postTitle.value = "";
          $('#summernote').code("");
          event.target.categories.value = "";
          
          Router.go('dashboard');
        }

      });


      Template.blogLists.helpers({
        blogs: function(){
          var author = Meteor.user().username;
          return BlogList.find({createdBy: author});
        },
        selected: function(){
          var postId = this._id;
          var selectedPost = Session.get('selectedPost');
          if(postId === selectedPost){
              // console.log(postId);
              return "selected";
          }
        }
      });

      Template.guestBlogLists.helpers({
        
        blogs:function(){
          return myPagination.find({},{itemsPerPage:3});
        }
      });

      Template.dashboard.events({
        'click .delete':function(){
          var selectedPost = Session.get('selectedPost');
          var conf = confirm("Are you sure you want to delete this post?");
          if(conf){
            Meteor.call('removePostData',selectedPost);
          }
        },
        'click .blogPost': function(){
          var postId = this._id;
          var selectedPost = Session.set('selectedPost',postId);
        },
        'click .edit':function(){
          var selectedPost = Session.get('selectedPost');
          var postInfo = BlogList.findOne({_id:selectedPost});
          var selectedPostInfo = Session.set('selectedPostInfo',postInfo);
        }
      });

      Template.editPost.helpers({
        thePost: function(){
          return Session.get('selectedPostInfo');
        }
      });

      Template.editPost.events({
        'submit .editPostForm':function(event){
          event.preventDefault();
          var selectedPost = Session.get('selectedPost');
          var postTitle = event.target.postTitle.value;
          var postContent = $('#summernote').code();
          var categories = event.target.categories.value;

          Meteor.call('editPostData',selectedPost,postTitle,postContent,categories);

          Router.go('dashboard');
        }
      });



      Template.register.events({
        'submit .registerForm':function(event){
            event.preventDefault();
            var username = $('[name=userName]').val();
            var password = $('[name=passWord]').val();
            var rePassword = $('[name=rePassword]').val();
            var emailAdd = $('[name=emailAdd]').val();

              Accounts.createUser({
                username:username,
                password: password,
                email:emailAdd
              }, function(error){
                  if(error){
                      console.log(error.reason); // Output error if registration fails
                  } else {
                      Router.go("blog"); // Redirect user if registration succeeds
                  }
              });

            
        }
      });

      Template.login.events({
        'submit .loginForm': function(event){
          event.preventDefault();
          var username = $('[name=loginUser]').val();
          var password = $('[name=loginPass]').val();

          Meteor.loginWithPassword(username,password, function(error){
              if(error){
                  console.log(error.reason);
                  console.log(username,password);
              } else {
                  Router.go('blog');
              }
          });
        }
      });

      Template.main.events({
        'click .logout':function(event){
          event.preventDefault();
          Meteor.logout();
          Router.go('blog');
        }
      });


      Meteor.subscribe('thePosts');

}

if(Meteor.isServer){  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish('thePosts',function(){
    return BlogList.find();
  });


  Meteor.methods({
    addNewPostData: function(postTitle,postContent,categories,author){
      BlogList.insert({
              postTitle: postTitle,
              postContent: postContent,
              categories: categories,
              createdBy: author,
              createdAt: new Date()
      });
    },

    removePostData:function(selectedPost){
        BlogList.remove(selectedPost);
    },

    editPostData: function(selectedPost,postTitle,postContent,categories){
      BlogList.update({_id:selectedPost},{$set:{
            postTitle: postTitle,
            postContent: postContent,
            categories:categories
          }});
    }
  });

}

// routing

Router.route('/addNewPost');
Router.route('/editPost');
Router.route('/dashboard');
Router.route('/loginNregister');
Router.route('/',{
  name: 'blog',
  template: 'blog'
});
Router.configure({
  layoutTemplate: 'main'
});

Router.route('/blogs/:_id',{
  template:'blogListPage',
  data: function(){
    var currentList = this.params._id;
    return BlogList.findOne({_id:currentList});
  }
});


