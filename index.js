const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//escutar o aplicativo para ficar pronto

app.on('ready', () => {
    //cria uma uma nova janela
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    //carrega a pagina HTML na janela
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'coreWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Sai do aplicativo quando encerrado
    mainWindow.on('closed', () => {
        app.quit()
    })

    //cria o menu com a origem de seu template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insere o menu
    Menu.setApplicationMenu(mainMenu);
});

//escuta createAppWindow
const createAddWindow = () => {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add a ToDo',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    //carrega a pagina HTML na janela
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //garbage collection handle
    addWindow.on('close', () => {
        addWindow = null;
    })
}

// pega task:add
ipcMain.on('task:add', (e, item) => {
    console.log(item)
    mainWindow.webContents.send('task:add', item);
    addWindow.close();
})

//Cria o template do menu
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow()
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('task:clear')
                }
            },
            {
                label: 'Quit',
                //adiciona atalho para essa função
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

if(process.platform === 'darwin'){
    mainMenuTemplate.unshift({});
}

if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Dev Tools',
        submenu: [
            {
                label: 'Toggle Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools()
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}
