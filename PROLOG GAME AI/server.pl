:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_files)).

% Server configuration
server(Port) :-
    http_server(http_dispatch, [port(Port)]).

% Static File Handler
:- http_handler('/', http_reply_from_files('.', []), [prefix]).

% API Handler
:- http_handler('/move', handle_move, []).

handle_move(Request) :-
    http_read_json_dict(Request, Query),
    Board = Query.board,
    % AI plays 'O'
    (   best_move_minimax(Board, 'O', NextBoard)
    ->  reply_json_dict(_{board: NextBoard})
    ;   reply_json_dict(_{board: Board}) % No move possible (draw/end)
    ).

% --- Game Logic & Minimax ---

% Winning lines
win_line([1,2,3]).
win_line([4,5,6]).
win_line([7,8,9]).
win_line([1,4,7]).
win_line([2,5,8]).
win_line([3,6,9]).
win_line([1,5,9]).
win_line([3,5,7]).

% Get cell value (1-based index)
get_cell(Board, Index, Value) :- nth1(Index, Board, Value).

% Set cell value
set_cell(Board, Index, Value, NewBoard) :-
    nth1(Index, Board, _, Rest),
    nth1(Index, NewBoard, Value, Rest).

% Check if cell is empty
is_empty(null).
is_empty(@(null)).

% Check for winner
winner(Board, Player) :-
    win_line(Indices),
    maplist(get_cell(Board), Indices, Values),
    maplist(=(Player), Values).

% Check for draw (no empty cells)
is_draw(Board) :-
    \+ (member(Val, Board), is_empty(Val)).

% Game Over check
game_over(Board, Winner) :- winner(Board, 'X'), Winner = 'X'.
game_over(Board, Winner) :- winner(Board, 'O'), Winner = 'O'.
game_over(Board, 'Draw') :- is_draw(Board).

% Opponent
opponent('X', 'O').
opponent('O', 'X').

% --- Minimax Implementation ---

% Entry point for AI move
best_move_minimax(Board, Player, BestBoard) :-
    findall(Move-Score, (
        valid_move(Board, Player, Move, NextBoard),
        minimax(NextBoard, Player, Score) % Pass Player to know who just moved
    ), Moves),
    % If Player is 'O' (AI), we want to MAXIMIZE score.
    % But wait, minimax usually returns value for the player whose turn it is?
    % Let's standardise:
    % Score is always from perspective of AI ('O').
    % 'O' wins = 10, 'X' wins = -10.
    % So 'O' picks max score.
    sort(2, @>=, Moves, [BestMove-_|_]), % Sort descending by score
    valid_move(Board, Player, BestMove, BestBoard).

% Get all valid next board states
valid_move(Board, Player, Index, NewBoard) :-
    nth1(Index, Board, Val),
    is_empty(Val),
    set_cell(Board, Index, Player, NewBoard).

% Minimax Value
% If game is over, return static evaluation
minimax(Board, _, Score) :-
    game_over(Board, Winner), !,
    eval(Winner, Score).

% If game not over, simulate opponent's best play
minimax(Board, LastPlayer, Score) :-
    opponent(LastPlayer, CurrentPlayer),
    findall(Val, (
        valid_move(Board, CurrentPlayer, _, NextBoard),
        minimax(NextBoard, CurrentPlayer, Val)
    ), Values),
    (   CurrentPlayer == 'O'
    ->  max_list(Values, Score) % AI maximizes
    ;   min_list(Values, Score) % Human minimizes
    ).

% Static Evaluation
eval('O', 10).
eval('X', -10).
eval('Draw', 0).

% Helper for max/min list
max_list([H|T], Max) :- max_list(T, H, Max).
max_list([], Max, Max).
max_list([H|T], CurrentMax, Max) :-
    (H > CurrentMax -> NewMax = H ; NewMax = CurrentMax),
    max_list(T, NewMax, Max).

min_list([H|T], Min) :- min_list(T, H, Min).
min_list([], Min, Min).
min_list([H|T], CurrentMin, Min) :-
    (H < CurrentMin -> NewMin = H ; NewMin = CurrentMin),
    min_list(T, NewMin, Min).
