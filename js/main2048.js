var board = new Array(); //一维数组
var score = 0;
var hasConflicted=new Array(); //解决每一个格子只能叠加一次的问题

//手机触控坐标
var startx=0,
    starty=0,
    endx=0,
    endy=0;

$(function() {
    prepareForMobile();
    newGame();
});

function prepareForMobile(){

    if(documentWidth>500){
        gridContentWidth=500;
        cellSpace=20;
        cellSideLength=100;
    }

    $('#grid-container').css({
        width:gridContentWidth-2*cellSpace,
        height:gridContentWidth-2*cellSpace,
        padding:cellSpace,
        "border-radius":0.02*gridContentWidth
    });
    $('.grid-cell').css({
        width:cellSideLength,
        height:cellSideLength,
        "border-radius":0.02*gridContentWidth
    })
}

function newGame() {
    //初始化棋盘格
    initChess();

    //随机生成两个数字
    generateOneNumber();
    generateOneNumber();
};

function initChess() {
    //16个grid-cell
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            //棋盘子
            var gridCell = $('#grid-cell-' + i + '-' + j);
            gridCell.css({
                top: getPosTop(i, j),
                left: getPosLeft(i, j)
            });
        };
    };

    //16个number-cell
    for (var i = 0; i < 4; i++) {
        board[i] = new Array(); //二维数组
        hasConflicted[i] = new Array();//二维数组
        for (var j = 0; j < 4; j++) {
            board[i][j] = 0; //初始化这个二维数组的值(16个)
            hasConflicted[i][j]=false;  //每一个在初始化时都没有进行过碰撞
        };
    };

    //二维数组与前端每个数字的对接
    updateBoardView();

    //游戏分数
    score=0;
};


//二维数组与前端每个数字的对接
function updateBoardView() {
    //假如一开始有number-cell，需要清除掉
    $('.number-cell').remove();

    //js动态生成number
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            $('<div>', {
                class: 'number-cell',
                id: 'number-cell-' + i + '-' + j
            }).appendTo($('#grid-container'));
            var numberCell = $('#number-cell-' + i + '-' + j);
            if (board[i][j] == 0) {
                //让numberCell不显示
                numberCell.css({
                    width: 0,
                    height: 0,
                    top: getPosTop(i, j) + cellSideLength/2,
                    left: getPosLeft(i, j) + cellSideLength/2
                });
            }else {
                //让numberCell显示,把gridCell覆盖
                numberCell.css({
                    width: cellSideLength,
                    height: cellSideLength,
                    top: getPosTop(i, j),
                    left: getPosLeft(i, j),
                    backgroundColor: getNumBackgroundColor(board[i][j]),
                    color: getNumColor(board[i][j])
                });
                numberCell.text(board[i][j]);
            }

            hasConflicted[i][j]=false;
            $('.number-cell').css('line-height',cellSideLength+'px');
            $('.number-cell').css('font-size',0.6*cellSideLength+'px');
        };
    };
};


function generateOneNumber() {
    //当棋盘上没空间时
    if (nospace(board)) {
        return false;
    } else {
        //当棋盘上有空间时

        //随机一个位置
        var randx = parseInt(Math.floor(Math.random() * 4));
        var randy = parseInt(Math.floor(Math.random() * 4));
        //如果位置上有数字时，不能使用这个数字

        //写一个死循环，判断位置是否为空，为空时break，表示可用
        /*while (true) {
            if (board[randx][randy] == 0){
                break; //表示可用，跳出死循环
            }

            //如果不可用，需要重新创建，然后再进行判断可不可用，直到可用
            randx = parseInt(Math.floor(Math.random() * 4));
            randy = parseInt(Math.floor(Math.random() * 4));
        }*/
        //优化随机算法
        var times=0;
        //让计算机猜50次，如何还是没有计算出来
        while (times<50) {
            if (board[randx][randy] == 0){
                break; //表示可用，跳出死循环
            }

            //如果不可用，需要重新创建，然后再进行判断可不可用，直到可用
            randx = parseInt(Math.floor(Math.random() * 4));
            randy = parseInt(Math.floor(Math.random() * 4));

            times++;
        }
        //则人工生成一个出来
        if(times==50){
        	for( var i = 0 ; i < 4 ; i ++ ){
        		for( var j = 0 ; j < 4 ; j ++ ){
        			if(board[i][j]==0){
        				randx=i;
        				randy=j;
        			}
        		}
        	}
        }

        //随机一个数字
        var randNumber = Math.random() < 0.5 ? 4 : 2;

        //在随机位置显示随机数字
        board[randx][randy] = randNumber;
        //在前端中以动画的方式显示这个数字
        showNumWithAnimation(randx, randy, randNumber);

        return true;
    }
};

$(document).keydown(function(event) {
    switch (event.keyCode) {
        case 37: //left
            event.preventDefault();
            if (moveLeft()) {
                setTimeout('generateOneNumber()',210);
                setTimeout('isGameOver()',300);
            };

            break;
        case 38: //top
            event.preventDefault();
            if (moveUp()) {
                setTimeout('generateOneNumber()',210);
                setTimeout('isGameOver()',300);
            };
            break;
        case 39: //right
            event.preventDefault();
            if (moveRight()) {
                setTimeout('generateOneNumber()',210);
                setTimeout('isGameOver()',300);
            };
            break;
        case 40: //down
            event.preventDefault();
            if (moveDown()) {
                setTimeout('generateOneNumber()',210);
                setTimeout('isGameOver()',300);
            };
            break;
        default:
            break;
    }
});


document.addEventListener('touchstart',function(event){
	//event.preventDefault();
    startx=event.touches[0].pageX;
    starty=event.touches[0].pageY;
});

//解决有时手指识别不管用的bug
document.addEventListener('touchmove',function(event){
    //防止前面event.preventDefault()把touch事件都禁止了
    event.preventDefault();
});

document.addEventListener('touchend',function(event){
	//event.preventDefault();
    endx=event.changedTouches[0].pageX;
    endy=event.changedTouches[0].pageY;

    var deltax=endx-startx;
    var deltay=endy-starty;

    //解决手指点击的误操作
    if(Math.abs(deltax)<0.3*documentWidth&&Math.abs(deltay)<0.3*documentWidth){
        return;//不进行后续执行
    }

    //在x方向滑动
    if(Math.abs(deltax)>=Math.abs(deltay)){

        //向右滑动
        if(deltax>0){
            if (moveRight()) {
                setTimeout('generateOneNumber()',210);
                setTimeout('isGameOver()',300);
            };
        }else{
        //向左滑动
             if (moveLeft()) {
                setTimeout('generateOneNumber()',210);
                setTimeout('isGameOver()',300);
            };
        }

    }else{
    //在y方向滑动
        
        //向下滑动(与数学坐标轴有点不同，y轴下方是正数)
        if(deltay>0){
            if (moveDown()) {
                setTimeout('generateOneNumber()',210);
                setTimeout('isGameOver()',300);
            };
        }else{
        //向上滑动
             if (moveUp()) {
                setTimeout('generateOneNumber()',210);
                setTimeout('isGameOver()',300);
            };
        }
    }
})

function isGameOver() {
	if(nospace(board)&&nomove(board)){
		gameover();
	}
}

function gameover(){
	alert('game over!');
}

function moveLeft(){

    if( !canMoveLeft( board ) )
        return false;

    //moveLeft
    for( var i = 0 ; i < 4 ; i ++ )
        for( var j = 1 ; j < 4 ; j ++ ){
            if( board[i][j] != 0 ){
            	//落脚点位置board[i][k]
                for( var k = 0 ; k < j ; k ++ ){
                    if( board[i][k] == 0 && noBlockHorizontal( i , k , j , board ) ){
                        //move
                        showMoveAnimation( i , j , i , k );
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    else if( board[i][k] == board[i][j] && noBlockHorizontal( i , k , j , board ) && !hasConflicted[i][k]){
                        //move
                        showMoveAnimation( i , j , i , k );
                        //add
                        board[i][k] *= 2;
                        board[i][j] = 0;
                        //add score
    					score+=board[i][k];
    					updateScore(score);

    					hasConflicted[i][k]=true;
                        continue;
                    }
                }
            }
        }

    setTimeout("updateBoardView()",200);
    return true;
}

function moveRight(){
    if( !canMoveRight( board ) )
        return false;

    //moveRight
    for(var i=0;i<4;i++){
    	for(var j=2;j>=0;j--){
    		//落脚点位置
    		for(var k=3;k>j;k--){
    			if(board[i][k]==0&&noBlockHorizontal(i,j,k,board)){
    				//move
    				showMoveAnimation(i,j,i,k);
    				board[i][k]=board[i][j];
    				board[i][j]=0;
    				continue;
    			}else if(board[i][k]==board[i][j]&&noBlockHorizontal(i,j,k,board)&& !hasConflicted[i][k]){
    				//move
    				showMoveAnimation(i,j,i,k);
    				board[i][k]*=2;
    				board[i][j]=0;
    				//add score
    				score+=board[i][k];
    				updateScore(score);

    				hasConflicted[i][k]=true;
    				continue;
    			}
    		}
    	}
    }

    setTimeout("updateBoardView()",200);
    return true;
}

function moveUp(){

    if( !canMoveUp( board ) )
        return false;

    //moveUp
    for( var j = 0 ; j < 4 ; j ++ )
        for( var i = 1 ; i < 4 ; i ++ ){
            if( board[i][j] != 0 ){
                for( var k = 0 ; k < i ; k ++ ){

                    if( board[k][j] == 0 && noBlockVertical( j , k , i , board ) ){
                        showMoveAnimation( i , j , k , j );
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    else if( board[k][j] == board[i][j] && noBlockVertical( j , k , i , board )&& !hasConflicted[k][j] ){
                        showMoveAnimation( i , j , k , j );
                        board[k][j] *= 2;
                        board[i][j] = 0;
                        //add score
    					score+=board[k][j];
    					updateScore(score);
    					//这样每一次只能碰撞一次
    					hasConflicted[k][j]=true;
                        continue;
                    }
                }
            }
        }

    setTimeout("updateBoardView()",200);
    return true;
}

function moveDown(){
	if(!canMoveDown(board)){
		return false;
	}
	//moveDown
	for(var i=2;i>=0;i--){
		for(var j=0;j<4;j++){
			if(board[i][j]!=0){
				//落脚点位置
				for(var k=3;k>i;k--){
					if(board[k][j]==0&&noBlockVertical(j,i,k,board)){
						//move
						showMoveAnimation( i , j , k , j );
						board[k][j]=board[i][j];
						board[i][j]=0;
						continue;
					}else if(board[k][j]==board[i][j]&&noBlockVertical(j,i,k,board)&& !hasConflicted[k][j]){
						//move
						showMoveAnimation( i , j , k , j );
						board[k][j]*=2;
						board[i][j]=0;
						//add score
    					score+=board[k][j];
    					updateScore(score);

    					hasConflicted[k][j]=true;
						continue;
					}
				}
			}
		}
	}

	setTimeout("updateBoardView()",200);
	return true;
}