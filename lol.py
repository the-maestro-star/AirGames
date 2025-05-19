import random

words = random.choice(["merry", "had", "little","lamb", "happy"])

# secret word
secret_word = words

#displays the dashes representing hidden word
dashes = '-' * len(secret_word)

#guesses left
guesses_left = 10   

#Fuction to update the dashes if guess made is correct
def update_dashes(secret_word, current_dashes, guess):
    result = ''
    for i in range(len(secret_word)):
        if secret_word[i] == guess:
            result += guess
        else:
            result += current_dashes[i]
    return result

#Function to get users guess and make checks
def get_guess():
    current_dashes = dashes
    global guesses_left
    print(f'{guesses_left} incorrect guesses left.')
    
    while guesses_left > 0:
        print(current_dashes)
        user_guess = input('Guess: ')
        
        if len(user_guess) == 1:
            if not user_guess.islower():
                print('Your guess must be a lowercase letter!')
                
            else:
                if user_guess in secret_word:
                    print('That letter is in the secret word!')
                    current_dashes = update_dashes(secret_word, current_dashes, user_guess)
                    if current_dashes == secret_word:
                        print(f'Congrats! You win. The word was: {secret_word}')
                        break
                    else:
                        continue
                else:
                    print('That letter is not in the secret word!')
                    guesses_left -= 1
                    print(f'{guesses_left} incorrect guesses left.')
        else:
            print('Your guess must have exactly one character!')
            
    if current_dashes != secret_word:    
        print(f'You lose. The correct word is: {secret_word}')
    
    
get_guess()