const fs = require('fs')
const path = require('path')

const guidePath = path.join(__dirname, 'docs/guide')


let count = 0
fs.readdir('./docs/guide', (err, files) => {
    files.forEach(file => {
        fs.readFile(path.join(guidePath, file), 'utf-8', (err, data) => {
            if (err) {
                console.log(err)
            } else {
                count = fnGetCpmisWords(data) + count
                console.log(count);
                
            }
        })
    })
})


function fnGetCpmisWords(str){
	sLen = 0;
	try{
		//先将回车换行符做特殊处理
   		str = str.replace(/(\r\n+|\s+|　+)/g,"龘");
		//处理英文字符数字，连续字母、数字、英文符号视为一个单词
		str = str.replace(/[\x00-\xff]/g,"m");	
		//合并字符m，连续字母、数字、英文符号视为一个单词
		str = str.replace(/m+/g,"*");
   		//去掉回车换行符
		str = str.replace(/龘+/g,"");
		//返回字数
		sLen = str.length;
	}catch(e){
		console.log(e)
    }
    
    
    return sLen
}
