class Image {
    constructor(title, url) {
        this.title = title;
        this.url = url;
    }
}

class User {
    constructor(email) {
        this.email = email;
    }
}

class Rating {
    constructor(user_id, image_id, value) {
        this.user_id = user_id;
        this.image_id = image_id;
        this.value = value;
    }
}