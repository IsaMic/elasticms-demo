import dynForm from "./dyn-forms";


export default function form() {
    const iframes = document.querySelectorAll('iframe[data-form-id]');
    for (let i = 0; i < iframes.length; i++) {
        const form = new skeletonForm(iframes[i]);
        form.loadForm(iframes[i]);
    }

    console.log(iframes.length + ' forms have been initiated');
}

export class skeletonForm
{
    constructor(iframe)
    {
        this.iframe = iframe;
    }

    loadForm(iframe) {
        const self = this;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc.readyState  !== 'complete'){
            iframe.onload = function() {
                self.loadForm(iframe);
            }
            return;
        }
        const formId = iframe.getAttribute('data-form-id');
        const messageId = iframe.getAttribute('data-message-id');

        const emsForm = new window.emsForm({
            'idForm': formId,
            'idMessage': messageId,
            'idIframe': iframe.id,
            'context': self,
            'onLoad': function() {
                self.onLoad(this.elementForm, this.elementMessage);
            },
            'onSubmit': function() {
                self.onSubmit(this.elementForm, this.elementMessage);
            },
            'onError': function(errorMessage) {
                self.onError(this.elementForm, this.elementMessage, errorMessage);
            },
            'onResponse': function(json) {
                self.onResponse(this.elementForm, this.elementMessage, json);
            }
        });
        emsForm.init();
    }

    onLoad(elementForm, elementMessage) {
        dynForm(elementForm.id);
        const self = this;
        const fileFields = elementForm.querySelectorAll('input[type=file]');
        for (let i = 0; i < fileFields.length; i++) {
            fileFields[i].onchange = function() {
                self.updateFileField(this);
            }
        }
        console.log('My onload function');
    }

    onSubmit(elementForm, elementMessage) {
        const inputs = elementForm.querySelectorAll('input,button,textarea');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].setAttribute('disabled',true)
        }
        console.log('My submit function');
    }

    onError(elementForm, elementMessage, errorMessage) {
        console.log('My error function:' + errorMessage);
    }

    onResponse(elementForm, elementMessage, json) {
        console.log('My response function');
    }

    updateFileField(fileField) {
        const filenames = [];
        for (var i = 0; i < fileField.files.length; ++i) {
            filenames.push(fileField.files.item(i).name.split("\\").pop().replace('%20', ' '));
        }
        const translations = JSON.parse(document.body.getAttribute('data-translations'));

        console.log(translations);

        const fileLabel = fileField.parentNode.querySelector('.custom-file-label');
        const fileList = fileField.parentNode.parentNode.querySelector('.file-list');
        console.log(fileList);
        if(filenames.length === 0) {
            fileLabel.classList.remove('selected');
            fileLabel.innerHTML = '';
            fileList.innerHTML = '';
        }
        else if (filenames.length === 1) {
            fileLabel.classList.add('selected');
            fileLabel.innerHTML = filenames.pop();
            fileList.innerHTML = '';
        }
        else {
            fileLabel.classList.add('selected');
            fileLabel.innerHTML = translations.file_selected.replace('%count%', filenames.length);
            for (var i = 0; i < filenames.length; ++i) {
                const li = document.createElement('li');
                li.innerHTML = filenames[i];
                fileList.appendChild(li);
            }
        }
    }
}
