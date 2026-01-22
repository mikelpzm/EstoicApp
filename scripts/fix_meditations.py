#!/usr/bin/env python3
"""
Script to fix truncated meditations with manually verified corrections.
"""

import json

def load_meditations(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_meditations(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Manually verified corrections for truncated meditations
# These have been carefully extracted from the PDF and cleaned of footnotes
CORRECTIONS = {
    # Book 6, Chapter 14 - The example provided by the user
    (6, 14): """La mayor parte de las cosas que el vulgo admira se refieren a las más generales, a las constituidas por una especie de ser o naturaleza: piedras, madera, higueras, vides, olivos. Las personas un poco más comedidas tienden a admirar los seres animados, como los rebaños de vacas, ovejas o, sencillamente, la propiedad de esclavos. Y las personas todavía más agraciadas, las cosas realizadas por el espíritu racional, mas no el universal, sino aquél en tanto que es hábil en las artes o ingenioso de otra manera [o simplemente capaz de adquirir multitud de esclavos]. Pero el que honra el alma racional universal y social no vuelve su mirada a ninguna de las restantes cosas y, ante todo, procura conservar su alma en disposición y movimiento acorde con la razón y el bien común, y colabora con su semejante para alcanzar ese objetivo.""",

    # Book 4, Chapter 10
    (4, 10): """«Que todo lo que acontece, justamente acontece.» Lo constatarás, si prestas la debida atención. No digo sólo que acontece consecuentemente, sino también según lo justo e incluso como si alguien asignara la parte correspondiente en razón de su mérito. Sigue, pues, observando como has empezado, y cuanto hagas, hazlo aunándolo con esto: con ser bueno; bueno de acuerdo con la propia concepción de la bondad. Observa eso en toda actividad.""",

    # Book 4, Chapter 45
    (4, 45): """Las consecuencias están siempre vinculadas con los antecedentes; pues no se trata de una simple enumeración aislada y que contiene tan sólo lo determinado por la necesidad, sino de una combinación racional. Y al igual que las cosas que existen están coordinadas armónicamente, así también los acontecimientos que se producen manifiestan no una simple sucesión, sino una admirable afinidad.""",

    # Book 6, Chapter 12
    (6, 12): """Si tuvieras simultáneamente una madrastra y una madre, atenderías a aquélla, pero con todo las visitas a tu madre serían continuas. Eso tienes tú ahora: el palacio y la filosofía. Así pues, retorna a menudo a ella y en ella reposa; gracias a ésta, las cosas de allí te parecen soportables y tú eres soportable entre ellos.""",

    # Book 6, Chapter 22
    (6, 22): """Yo, personalmente, hago lo que debo; lo demás no me atrae, porque es algo que carece de vida, o de razón, o anda extraviado y desconoce el camino.""",

    # Book 6, Chapter 42
    (6, 42): """Todos colaboramos en el cumplimiento de un solo fin, unos consciente y consecuentemente, otros sin saberlo; como Heráclito, creo, dice, que, incluso los que duermen son trabajadores y colaboradores en lo que acontece en el mundo. Uno colabora de una manera y otro de otra; e incluso el que murmura e intenta oponerse a los acontecimientos y destruirlos colabora, y en abundancia. Pues el que gobierna el conjunto del universo tenía necesidad también de tal sujeto. Mira, por tanto, con quién te alineas; que aquél, que el conjunto del universo gobierna, te utilizará en cualquier caso y te dará cabida entre los colaboradores y coadyuvantes. Pero tú no ocupes tal puesto cual el verso ridículo y malo de la tragedia, que Crisipo menciona.""",

    # Book 6, Chapter 56
    (6, 56): """El que vio el presente todo lo vio: tanto cuantas cosas han acontecido desde la eternidad, como cuantas acontecerán hasta el infinito. Pues todas son del mismo género y especie.""",

    # Book 8, Chapter 21
    (8, 21): """Gíralo y contempla cómo es, y cómo llega a ser después de envejecer, enfermar y expirar. Corta es la vida del que alaba y del alabado, del que recuerda y del recordado. E incluso eso acontece en un rincón de esta región, y ni siquiera aquí todos están de acuerdo, e incluso uno mismo no está de acuerdo consigo. Y toda la tierra es un punto.""",

    # Book 9, Chapter 10
    (9, 10): """Produce su fruto el hombre, Dios y el mundo; cada uno lo produce en su propia estación. Pero si habitualmente la palabra se aplica a la vid y a cosas semejantes, nada importa. La razón tiene su fruto, común y particular; y brotan de ella cosas tales cual ella misma es.""",

    # Book 9, Chapter 35
    (9, 35): """La pérdida no es otra cosa que una transformación. Y en eso se regocija la naturaleza del conjunto universal; según ella todas las cosas suceden bien, y de la misma forma han acontecido desde siempre, y otro tanto sucederá hasta el infinito. ¿Por qué dices, pues, que todo ha sucedido mal y que siempre sucederá mal, y que no se ha encontrado en suma, entre tantos dioses, poder alguno capaz de enderezar estas cosas, sino que el mundo está condenado a estar sumido en males incesantes?""",

    # Book 9, Chapter 40
    (9, 40): """O nada pueden los dioses o tienen poder. Si efectivamente no tienen poder, ¿por qué suplicas? Y si lo tienen, ¿por qué no les pides precisamente que te concedan el no temer ninguna de estas cosas, ni desear ninguna de éstas, ni afligirte por ninguna de éstas, antes que el que alguna de éstas esté presente o ausente? Porque, en suma, si pueden ayudar a los hombres, también en esto pueden ayudarles. Pero acaso dirás: «Los dioses pusieron eso en mi poder.» Entonces, ¿no es mejor usar lo que está en tu poder con libertad, que pretender con servilismo y sin decoro lo que no está en tu poder? ¿Y quién te ha dicho que los dioses no nos asisten también en lo que de nosotros depende? Empieza, pues, a suplicarles esas cosas y lo verás. Éste les pide: «¿Cómo conseguiré acostarme con aquélla?» Tú: «¿Cómo conseguiré no desear acostarme con ella?» Otro: «¿Cómo conseguiré librarme de aquél?» Tú: «¿Cómo conseguiré no tener necesidad de librarme?» Otro: «¿Cómo conseguiré no perder a mi hijo?» Tú: «¿Cómo conseguiré no temer perderlo?» En suma, vuelve tus súplicas hacia esa dirección y observa lo que sucede.""",

    # Book 11, Chapter 8
    (11, 8): """Una rama cortada de la rama contigua es imposible que no haya sido cortada también del árbol entero. De igual modo, un hombre, al quedar separado de un solo hombre, se ha apartado de la comunidad entera. Pues bien, la rama la corta otro; pero el hombre se separa él mismo de su vecino, odiándole y rechazándole; e ignora que simultáneamente se ha cortado a sí mismo de la comunidad entera. Con todo, hay un don de Zeus, el que constituyó la comunidad: nos es posible volver a unirnos de nuevo al vecino y volver a ser partes integrantes del conjunto. Sin embargo, si se produce frecuentemente tal clase de separación, hace difícil la unión y la restauración de la parte que se ha ido. En suma, no es semejante la rama que desde el principio creció con el árbol y siguió respirando junto con él, que la que, después de seccionada, fue injertada de nuevo, digan lo que digan los arboricultores.""",

    # Book 11, Chapter 13
    (11, 13): """¿Me despreciará alguien? Él verá. Yo, por mi parte, estaré a la espectativa para no ser sorprendido haciendo o diciendo algo merecedor de desprecio. ¿Me odiará? Él verá. Pero yo seré benévolo y afable con todo el mundo, y también estaré dispuesto a mostrar al que me odia su error, sin hacerle reproches ni como haciendo ostentación de mi paciencia, antes bien, con nobleza y bondad, como el famoso Foción, si es que aquél no fingía. Porque así deben ser las disposiciones interiores y debes mostrarte a los dioses como un hombre que no se indigna por nada y que nada lleva a mal. Porque, ¿qué mal te sobrevendrá si haces ahora lo que es apropiado a tu naturaleza, y aceptas lo que ahora es oportuno a la naturaleza del conjunto universal, si eres un hombre destinado a que se cumpla de una forma u otra lo que interesa a la comunidad?""",

    # Book 11, Chapter 25
    (11, 25): """Sócrates explica a Perdicas que el motivo de no ir a su casa era: «para no perecer de la muerte más desgraciada» es decir, «para no recibir un favor y no ser capaz de devolverlo.»""",
}

def main():
    print("Loading meditations...")
    data = load_meditations('/home/user/EstoicApp/src/data/meditations.json')

    fixes_made = 0

    print("\nApplying manual corrections...")

    for meditation in data['meditations']:
        key = (meditation['book'], meditation['chapter'])
        if key in CORRECTIONS:
            old_text = meditation['text']
            new_text = CORRECTIONS[key]

            meditation['text'] = new_text
            fixes_made += 1

            print(f"Fixed Book {meditation['book']}, Chapter {meditation['chapter']}")
            print(f"  Old length: {len(old_text)} chars")
            print(f"  New length: {len(new_text)} chars")
            print()

    if fixes_made > 0:
        print(f"\nSaving {fixes_made} corrections...")
        save_meditations('/home/user/EstoicApp/src/data/meditations.json', data)
        print("Done!")
    else:
        print("\nNo corrections to make.")

if __name__ == '__main__':
    main()
