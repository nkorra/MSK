from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')  # Homepage

@app.route('/about')
def about():
    return render_template('about.html')  # About Us Page

@app.route('/services')
def services():
    return render_template('services.html')  # Services Page

@app.route('/gallery')
def gallery():
    return render_template('gallery.html')  # Gallery Page

@app.route('/contact')
def contact():
    return render_template('contact.html')  # Contact Us Page

if __name__ == '__main__':
    app.run(debug=True)

