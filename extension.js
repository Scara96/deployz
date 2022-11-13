/**
* Created by Jacopo Scaravaggi - 13/11/2022
* 
* v0.0.1
*/


//Import vscode to interact with VsCode editor
const vscode = require('vscode');

//Wrapper containing all the files lists.
let _modifiedFiles = {};

//Setting of all files list.
_modifiedFiles.apexClasses = [];
_modifiedFiles.apexComponents = [];
_modifiedFiles.apexPages = [];
_modifiedFiles.apexTriggers = [];
_modifiedFiles.auraDefinitionBundle = [];
_modifiedFiles.genericFiles = [];

const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const yyyy = today.getFullYear();

const _todayString = dd + '-' + mm + '-' + yyyy;

/**
* Create a custom Uri for creating folder or file
* 
* PARAMETERS
* pathExtension: extends the path depending on create folder or file
*/
function getPath(pathExtension){
	return vscode.Uri.file("c:\\deployz\\" + pathExtension);
}

/**
* Given a files list it returns the string content to put on file
* 
* PARAMETERS
* header: title of the current section (Classes, Pages, Triggers...)
* fileList: list containing the names of modified files
* contentToReturn: string to return added with current files informations
*/
function stringifyFileList(header, fileList, contentToReturn){
	contentToReturn += header + ': \n';
	fileList.forEach(singleFile => {
		contentToReturn += singleFile.name + '\n';
	});

	contentToReturn += '\n\n';
	return contentToReturn;
}

/**
* Given the wrapper containing all the list of files it returns the full file content
* 
* PARAMETERS
* _modifiedFiles: wrapper containing all the list of files
*/
function createFileContent(_modifiedFiles) {

	let contentToReturn = 'MODIFIED FILE LIST ' + _todayString + '\n\n';
	
	if(_modifiedFiles){
		//Concat Apex Classes Names
		if(_modifiedFiles.apexClasses.length > 0){
			contentToReturn = stringifyFileList('Apex Classes', _modifiedFiles.apexClasses, contentToReturn);
		}
		
		//Concat Apex Component Names
		if(_modifiedFiles.apexComponents.length > 0){
			contentToReturn = stringifyFileList('Apex Component', _modifiedFiles.apexComponents, contentToReturn);
		}
		
		//Concat Apex Pages Names
		if(_modifiedFiles.apexPages.length > 0){
			contentToReturn = stringifyFileList('Apex Pages', _modifiedFiles.apexPages, contentToReturn);
		}
		
		//Concat Apex Trigger Names
		if(_modifiedFiles.apexTriggers.length > 0){
			contentToReturn = stringifyFileList('Apex Trigger', _modifiedFiles.apexTriggers, contentToReturn);
		}

		//Concat Aura Definition Bundles Names
		if(_modifiedFiles.auraDefinitionBundle.length > 0){
			contentToReturn = stringifyFileList('Aura Definition Bundle', _modifiedFiles.auraDefinitionBundle, contentToReturn);
		}

		//Concat Aura Definition Bundles Names
		if(_modifiedFiles.genericFiles.length > 0){
			contentToReturn = stringifyFileList('Generic Files', _modifiedFiles.genericFiles, contentToReturn);
		}
	}

	return contentToReturn;
}

/**
* Check if the file is already in the list, if not add the file
* 
* PARAMETERS
* currentFile: wrapper representing the current saved file
* fileList: file list to check if file is existent
*/
function addFileToList(currentFile, fileList) {

	let existentFile = false;
	fileList.forEach(singleFile => {
		if(singleFile.name == currentFile.name){
			existentFile = true;
		}
	});

	if(!existentFile) fileList.push(currentFile);
	return fileList;
} 

/**
* Write informations about the saved files in a text file
* 
* PARAMETERS
* fileName: file name
* fileContent: string parameters containing all the saved file's names
*/
function saveFile(fileContent) {
	
	let myWorkSpaceEdit = new vscode.WorkspaceEdit();
	let myUri = getPath(_todayString + '/changes_for_deploy.txt');

	myWorkSpaceEdit.createFile(myUri, {overwrite: true});
	myWorkSpaceEdit.set(myUri, [new vscode.TextEdit(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(100, 100)), fileContent)]);	

	vscode.workspace.applyEdit(myWorkSpaceEdit);
}

/**
* Create a directory to store modified files informations
*/
function createDirectory() {		
	vscode.workspace.fs.createDirectory(getPath(_todayString));	
}

/**
* Listener on file save
*/
vscode.workspace.onWillSaveTextDocument(event => {
	
	let splittedPath = event.document.fileName.split('\\');
	let splittedName = splittedPath[splittedPath.length - 1].split('.');

	let currentFile = {};
	currentFile.name = splittedName[0];
	currentFile.extension = splittedName[1];

	if(currentFile.name == 'changes_for_deploy') return;

	if(currentFile.extension == 'cls'){
		//Apex Class
		console.log('Apex Class named ' + currentFile.name + ' was saved.');
		_modifiedFiles.apexClasses = addFileToList(currentFile, _modifiedFiles.apexClasses);

	} else if (currentFile.extension == 'component'){
		//Apex Component
		console.log('Apex Component named ' + currentFile.name + ' was saved.');
		_modifiedFiles.apexComponents = addFileToList(currentFile, _modifiedFiles.apexComponents);

	} else if (currentFile.extension == 'page'){
		//Apex Page
		console.log('Apex Pages named ' + currentFile.name + ' was saved.');
		_modifiedFiles.apexPages = addFileToList(currentFile, _modifiedFiles.apexPages);

	} else if (currentFile.extension == 'trigger'){
		//Apex Trigger
		console.log('Apex Trigger named ' + currentFile.name + ' was saved.');
		_modifiedFiles.apexTriggers = addFileToList(currentFile, _modifiedFiles.apexTriggers);

	} else if (currentFile.extension == 'app' || 
				currentFile.extension == 'cmp' || 
				currentFile.extension == 'design' || 
				currentFile.extension == 'evt' || 
				currentFile.extension == 'intf' || 
				currentFile.extension == 'js' ||
				currentFile.extension == 'svg' ||
				currentFile.extension == 'css' ||
				currentFile.extension == 'auradoc' || 
				currentFile.extension == 'tokens'){
		//Aura Definition Bundle
		console.log('One element of an Aura Definition Bundle named ' + currentFile.name + ' was saved.');
		_modifiedFiles.auraDefinitionBundle = addFileToList(currentFile, _modifiedFiles.auraDefinitionBundle);

	} else {
		//Generic File
		console.log('Generic file named ' + currentFile.name + ' was saved.');
		_modifiedFiles.genericFiles = addFileToList(currentFile, _modifiedFiles.genericFiles);
	}

	console.log('@@>> _modifiedFiles >>> ' + JSON.stringify(_modifiedFiles));
	let fileContent = createFileContent(_modifiedFiles);

	saveFile(fileContent);
});

/**
* Function fired on extension activation
*/
function activate() {
	vscode.window.showInformationMessage('Welcome! DeployZ is now activated.');
	createDirectory();
}

/**
* Function fired on extension deactivation or editor closing
*/
function deactivate() {
}

module.exports = {
	activate,
	deactivate
}
