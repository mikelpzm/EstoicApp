#!/usr/bin/env python3
"""
Script to fix truncated meditations with manually verified corrections.
Extended version with comprehensive fixes.
"""

import json
import re

def load_meditations(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_meditations(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Manually verified corrections
CORRECTIONS = {
    # === LIBRO 1 ===
    (1, 9): """De Sexto: la benevolencia, el modelo de casa gobernada por la autoridad paterna, la noción de vivir conforme a la naturaleza; la gravedad sin afectación, la atención solícita a los amigos, la tolerancia con los ignorantes y con los que opinan sin reflexión; la armonía con todos, de manera que su trato era más agradable que cualquier adulación y le tenían, en aquel preciso momento, el máximo respeto; la capacidad de descubrir y ordenar, con método comprensible y sistemático, los principios necesarios para la vida; no haber dado nunca la impresión de cólera ni de ninguna otra pasión, antes bien, ser el menos afectado por las pasiones y a la vez el más afectuoso; la expresión del elogio sin estridencias, el saber polifacético sin ostentación.""",

    (1, 13): """De Catulo: no dar poca importancia a la queja de un amigo, aunque casualmente fuera infundada, sino intentar consolidar la relación habitual; el elogio cordial a los maestros, como se recuerda que hacían Domicio y Atenodoto; el amor verdadero por los hijos.""",

    (1, 16): """De mi padre: la mansedumbre y la firmeza serena en las decisiones profundamente examinadas. El no vanagloriarse con los honores aparentes; el amor al trabajo y la perseverancia; el estar dispuesto a escuchar a los que podían hacer una contribución útil a la comunidad. El distribuir a cada uno según su mérito sin vacilaciones. La experiencia para distinguir cuándo hay necesidad de un esfuerzo intenso, cuándo hay que ceder. El haber puesto fin a los amores con los adolescentes. La sociabilidad y el haber permitido a los amigos no asistir siempre a sus cenas y no tener obligación de acompañarle cuando iba de viaje. El ser hallado siempre igual por los que habían quedado atrás a causa de algún negocio. La investigación rigurosa en las deliberaciones y la tenacidad, sin renunciar prematuramente a la investigación, satisfecho con las primeras impresiones. El celo por conservar a los amigos sin cansarse nunca de ellos ni tampoco ser un loco por ellos. El bastarse a sí mismo en todo y la serenidad. La previsión desde lejos, la organización de los menores detalles sin aspavientos. La represión de las aclamaciones y de toda adulación dirigida a su persona. El velar constantemente por las necesidades del imperio, la administración de los recursos y la tolerancia de los que le criticaban por esto. Ningún temor supersticioso respecto a los dioses, y respecto a los hombres, ninguna demagogia ni deseo de agradar ni de complacer al pueblo, sino sobriedad en todo y firmeza; nada vulgar ni afán de novedades.""",

    (1, 17): """De los dioses: tener buenos abuelos, buenos padres, buena hermana, buenos maestros, buenos familiares, parientes y amigos, casi todos buenos. Y el no haber llegado fácilmente a ofender a ninguno de ellos, a pesar de tener una disposición natural que me hubiera permitido, en el caso de habérseme presentado la oportunidad, hacer algo así. Es un favor de los dioses que no se diera ninguna concatenación de circunstancias que pudiera ponerme en evidencia. El no haberme criado largo tiempo con la concubina de mi abuelo. El haber conservado la flor de la juventud y no haber demostrado antes de tiempo mi virilidad, sino incluso haberlo aplazado algún tiempo más. El haberme subordinado a un gobernante, mi padre, que iba a eliminar de mí todo orgullo y me iba a llevar a comprender que es posible vivir en palacio sin necesidad de guardia personal, ni de vestidos lujosos, ni de candelabros, ni de estatuas parecidas, y de pompa semejante; sino que es posible ceñirse a un nivel muy próximo al de un simple particular y no por eso perder dignidad ni ser más negligente en el cumplimiento de los deberes que competen al gobernante en defensa de los intereses de la comunidad. Todo esto «requiere ayudas de los dioses y de la Fortuna».""",

    # === LIBRO 4 ===
    (4, 21): """Si las almas perduran, ¿cómo, desde la eternidad, consigue el aire darles cabida? ¿Y cómo la tierra es capaz de contener los cuerpos de los que vienen enterrándose desde tantísimo tiempo? Pues al igual que aquí, después de cierta permanencia, la transformación y disolución de estos cuerpos cede el sitio a otros cadáveres, así también las almas trasladadas al aire, después de un tiempo determinado, se transforman, se difunden y se inflaman, reabsorbidas en la razón seminal del conjunto universal, y de esta manera ceden el sitio a las otras que vienen a establecerse allí. ¿Cómo investigar la verdad sobre este punto? Mediante la distinción entre la causa material y la formal.""",

    (4, 30): """El uno, sin túnica, vive como filósofo; el otro, sin libro; aquel otro, semidesnudo. «No tengo pan», dice, «pero persevero en la razón». Y yo tengo los recursos que proporcionan los estudios y no persevero.""",

    (4, 41): """«Eres una pequeña alma que sustenta un cadáver», como decía Epicteto.""",

    (4, 47): """Como si un dios te hubiese dicho: «Mañana morirás o, en todo caso, pasado mañana», no habrías puesto mayor empeño en morir pasado mañana que mañana, a menos que fueras extremadamente vil. (Porque, ¿cuánta es la diferencia?) De igual modo, no consideres de gran importancia morir después de muchos años antes que mañana.""",

    # === LIBRO 5 ===
    (5, 27): """Convive con los dioses. Y convive con los dioses aquel que constantemente les demuestra que su alma está satisfecha con la parte que le ha sido asignada, y hace todo cuanto quiere el genio divino que, en calidad de protector y guía, porción de sí mismo, Zeus ha dado a cada uno. Y este genio es la inteligencia y razón de cada uno.""",

    (5, 33): """En breve serás ceniza o un esqueleto, y un nombre o ni siquiera un nombre. Y el nombre, un ruido y un eco. Y las cosas estimadas en la vida, vacías y pútridas e insignificantes; perritos que se muerden mutuamente, niños que se pelean, que ríen y al punto lloran. Y la fidelidad, el pudor, la justicia y la verdad hacia el Olimpo se marcharon de la tierra de amplios caminos. ¿Qué es, pues, lo que aún te retiene aquí? Si las cosas sensibles son fácilmente cambiantes y nada estables; y los sentidos, torpes y susceptibles de recibir falsas impresiones, y el mismo hálito vital es una exhalación de la sangre; y la buena reputación entre semejantes gentes es vana. ¿Qué, pues, esperar? Tranquilamente aguarda la extinción o el traslado.""",

    (5, 36): """No te dejes arrastrar totalmente por la imaginación; antes bien, presta ayuda en la medida de tus posibilidades y según su mérito. Y aunque estén en inferioridad en las cosas mediocres, no imagines, sin embargo, que eso es dañino, pues sería un mal hábito. Como el anciano que, al irse, pedía la peonza de su pupilo, teniendo presente que era una peonza, también tú procede así.""",

    # === LIBRO 6 ===
    (6, 14): """La mayor parte de las cosas que el vulgo admira se refieren a las más generales, a las constituidas por una especie de ser o naturaleza: piedras, madera, higueras, vides, olivos. Las personas un poco más comedidas tienden a admirar los seres animados, como los rebaños de vacas, ovejas o, sencillamente, la propiedad de esclavos. Y las personas todavía más agraciadas, las cosas realizadas por el espíritu racional, mas no el universal, sino aquél en tanto que es hábil en las artes o ingenioso de otra manera [o simplemente capaz de adquirir multitud de esclavos]. Pero el que honra el alma racional universal y social no vuelve su mirada a ninguna de las restantes cosas y, ante todo, procura conservar su alma en disposición y movimiento acorde con la razón y el bien común, y colabora con su semejante para alcanzar ese objetivo.""",

    (6, 16): """Ni es meritorio transpirar como las plantas, ni respirar como el ganado y las fieras, ni ser impresionado por la imaginación, ni ser movido como una marioneta por los impulsos, ni agruparse como rebaños, ni alimentarse; pues eso es semejante a la evacuación de las sobras de la comida. ¿Qué vale la pena, entonces? ¿Ser aplaudido? No. Por consiguiente, tampoco ser aplaudido por golpeteo de lenguas, que las alabanzas del vulgo son golpeteo de lenguas. Por tanto, has renunciado también a la vanagloria. ¿Qué queda digno de estima? Opino que el moverse y mantenerse de acuerdo con la propia constitución, fin al que conducen las ocupaciones y las artes. Porque todo arte apunta a este objetivo, a que la cosa constituida sea adecuada a la obra que ha motivado su constitución.""",

    (6, 34): """¡Qué clase de placeres han disfrutado bandidos, lascivos, parricidas, tiranos!""",

    (6, 39): """Amóldate a las cosas que te han tocado en suerte; y a los hombres con los que te ha tocado en suerte vivir, ámalos, pero de verdad.""",

    (6, 54): """Lo que no beneficia al enjambre, tampoco beneficia a la abeja.""",

    (6, 30): """¡Cuidado! No te conviertas en un César, no te tiñas siquiera, porque suele ocurrir. Mantente, por tanto, sencillo, bueno, puro, respetable, sin arrogancia, amigo de lo justo, piadoso, benévolo, afable, firme en el cumplimiento del deber. Lucha por conservarte tal cual la filosofía ha querido hacerte. Respeta a los dioses, ayuda a salvar a los hombres. Breve es la vida. El único fruto de la vida terrena es una piadosa disposición y actos útiles a la comunidad. En todo, procede como discípulo de Antonino; su constancia en obrar conforme a la razón, su ecuanimidad en todo, su piedad, la serenidad de su rostro, su dulzura, su desprecio de la vanagloria, su afán en lo referente a la comprensión de las cosas. Y recuerda cómo él no habría omitido absolutamente nada sin haberlo previamente examinado a fondo y sin haberlo comprendido con claridad; y cómo soportaba sin replicar a los que le censuraban injustamente; y cómo no tenía prisas por nada; y cómo no aceptaba las calumnias; y cómo era escrupuloso indagador de las costumbres y de los hechos, pero no era insolente, ni le atemorizaba el alboroto, ni era desconfiado, ni charlatán. Y cómo tenía bastante con poco para su casa, por ejemplo, para su lecho, para su vestido, para su comida, para su servicio, y su laboriosidad y su paciencia. Hombre capaz de permanecer hasta el anochecer ocupado en la misma tarea, merced a su sobria alimentación, que no tenía necesidad de evacuar excrementos fuera de la hora acostumbrada; su firmeza e igualdad en las amistades; su capacidad de soportar a los que se oponían francamente a sus opiniones y de alegrarse, si alguno le mostraba algo mejor; y su religiosidad sin superstición. De modo que así te sorprenda, como a él, la última hora con buena conciencia.""",

    # === LIBRO 7 ===
    (7, 16): """Mi guía interior no se altera por sí mismo; quiero decir, no se asusta ni se aflige. Y si algún otro es capaz de asustarle o de afligirle, hágalo. Pues él, por sí mismo, no se moverá conscientemente a semejantes alteraciones. Preocúpese el cuerpo, si puede, de no sufrir nada. Y si sufre, manifiéstelo. También el espíritu animal, que se asusta, que se aflige. Pero lo que, en suma, piensa sobre estas afecciones, no hay ningún temor que sufra, pues no es capaz por su naturaleza de tal juicio. El guía interior, por su misma condición, carece de necesidades, a no ser que se las cree, y por eso mismo no tiene tribulaciones ni obstáculos, a no ser que se perturbe y se ponga obstáculos a sí mismo.""",

    (7, 22): """Propio del hombre es amar incluso a los que tropiezan. Y eso se consigue, en cuanto se te ocurra pensar que son tus familiares, y que pecan por ignorancia y contra su voluntad, y que, dentro de poco, ambos estaréis muertos y que, ante todo, no te dañó, puesto que no hizo a tu guía interior peor de lo que era antes.""",

    (7, 31): """Haz resplandecer en ti la sencillez, el pudor y la indiferencia en lo relativo a lo que es intermedio entre la virtud y el vicio. Ama al género humano. Sigue a Dios. Aquél dice: «Todo es convencional, y en realidad sólo existen los elementos.» Y basta recordar que no todas las cosas son convencionales, sino muy pocas.""",

    (7, 35): """Y a aquel pensamiento que, lleno de grandeza, alcanza la contemplación de todo tiempo y de toda esencia, ¿crees que le parece gran cosa la vida humana? Imposible, dijo. Entonces, ¿tampoco considerará terrible la muerte un hombre tal? En absoluto.""",

    (7, 46): """«Pero, mi buen amigo, mira si la nobleza y la bondad no serán otra cosa que salvar a los demás y salvarte a ti mismo. Porque no debe el hombre que se precie de serlo preocuparse de la duración de la vida, tampoco debe tener excesivo apego a ella, sino confiar a la divinidad estos cuidados y dar crédito a las mujeres cuando afirman que nadie podría evitar el destino. La obligación que le incumbe es examinar de qué modo, durante el tiempo que vaya a vivir, podrá vivir mejor.»""",

    (7, 50): """«Lo que ha nacido de la tierra a la tierra retorna; lo que ha germinado de una semilla etérea vuelve nuevamente a la bóveda celeste.» O también esto: disolución de los entrelazamientos en los átomos y dispersión semejante de los elementos impasibles.""",

    (7, 68): """Pasa la vida sin violencias en medio del mayor júbilo, aunque todos clamen contra ti las maldiciones que quieran, aunque las fieras despedacen los pobres miembros de esta masa pastosa que te circunda y sustenta. Porque, ¿qué impide que, en medio de todo eso, tu inteligencia se conserve en calma, tenga un juicio verdadero de lo que acontece en torno tuyo y esté dispuesta a hacer uso de lo que está a su alcance? De manera que tu juicio pueda decir a lo que acaezca: «Tú eres eso en esencia, aunque te muestres distinto en apariencia». Y tu uso pueda decir a lo que suceda: «Te buscaba. Pues para mí el presente es siempre materia de virtud racional, social y, en suma, materia de arte humano o divino». Todo cuanto acontece es familiar a Dios o al hombre, y ni es nuevo ni es difícil de manejar, sino conocido y fácil de manejar.""",

    # === LIBRO 8 ===
    (8, 57): """El sol parece estar difuso y, en verdad, lo está por doquier, pero no desborda. Pues esta difusión es extensión. Y así, sus destellos se llaman aktínes (rayos), procedentes del término ekteínesthai (extenderse). Y qué cosa es un rayo, podrías verlo, si contemplaras a través de una rendija la luz del sol introducida en una habitación oscura. Pues se extiende en línea recta y se apoya, en cierto modo, en el cuerpo sólido con el que tropiece, cuerpo que le separa del aire que viene a continuación. Allí se detiene sin deslizarse ni caer. Tal, en efecto, conviene que sea la difusión y dilatación de la inteligencia, sin desbordarse en ningún caso, pero sí extendiéndose; conviene también que, frente a los obstáculos con que tropiece, no choque violentamente, ni con ímpetu, ni tampoco caiga, sino que se detenga y dé brillo al objeto que la recibe. Porque se privará del resplandor el objeto que la desdeñe.""",

    # === LIBRO 9 ===
    (9, 1): """El que comete injusticias es impío. Pues dado que la naturaleza del conjunto universal ha constituido los seres racionales para ayudarse los unos a los otros, de suerte que se favoreciesen unos a otros, según su mérito, sin que en ningún caso se perjudicasen, el que transgrede esta voluntad comete, evidentemente, una impiedad contra la más excelsa de las divinidades. También el que miente es impío con la misma divinidad. Pues la naturaleza del conjunto universal es naturaleza de las cosas que son, y éstas están vinculadas con todas las cosas existentes. Más todavía, esta divinidad recibe el nombre de Verdad y es la causa primera de todas las verdades. En consecuencia, el hombre que miente voluntariamente es impío, en cuanto que al engañar comete injusticia. También es impío el que miente involuntariamente, en cuanto está en discordancia con la naturaleza del conjunto universal y en cuanto es indisciplinado al enfrentarse con la naturaleza del mundo. Porque se enfrenta el que se comporta de modo contrario a la verdad, a pesar suyo. Pues había obtenido de la naturaleza recursos que, de no haberlos descuidado, le habrían permitido distinguir lo falso de lo verdadero. Más aún, el que persigue el placer como un bien y esquiva los dolores como un mal, es impío. Porque un hombre tal es forzoso que critique muchas veces a la naturaleza común, porque reparte algo contrariamente al mérito a los malos y a los buenos, dado que frecuentemente los malos viven en medio de placeres y poseen los medios para procurárselos, mientras que los buenos tropiezan con el dolor y con lo que lo origina. Además, el que teme los dolores, temerá alguna vez algo de lo que va a suceder en el mundo, y eso es ya una impiedad. Y el que persigue los placeres no se abstendrá de cometer injusticias, y eso es una clara impiedad. Es preciso que los que quieren seguir a la naturaleza, estén en las mismas disposiciones respecto a aquellas cosas ante las cuales la naturaleza común se muestra indiferente; porque no las habría hecho ambas si no fuera indiferente a ambas. Por tanto, a los que no se muestran indistintamente indiferentes ante los dolores y los placeres, la muerte y la vida, la fama y la carencia de fama, cosas que la naturaleza universal usa indistintamente, es evidente que son impíos. Y cuando digo que la naturaleza común utiliza indistintamente estas cosas, digo que acontecen indistintamente, según la sucesión de lo que acontece; y sobrevienen debido a un primer impulso de la Providencia, según el cual, partiendo de un principio, se puso en movimiento hacia esta ordenación del mundo, concibiendo en sí misma ciertas razones de lo que iba a ser, y asignando poderes generadores de sustancias, transformaciones y sucesiones semejantes.""",

    (9, 22): """Corre al encuentro de tu guía interior, del guía del conjunto universal y del de éste. Del tuyo, para que hagas de él una justa inteligencia; del que corresponde al conjunto universal, para que rememores de quién formas parte; del de éste, para que sepas si existe ignorancia o reflexión en él, y, al mismo tiempo, consideres que es tu pariente.""",

    (9, 37): """Basta de vida miserable, de murmuraciones, de astucias. ¿Por qué te turbas?, ¿qué novedad hay en eso? ¿Qué te pone fuera de ti? ¿La causa? Examínala. ¿La materia? Examínala. Fuera de eso nada existe. Mas, a partir de ahora, sea tu relación con los dioses de una vez más sencilla y mejor. Lo mismo da haber indagado eso durante cien años que durante tres.""",

    (9, 42): """Siempre que tropieces con la desvergüenza de alguien, de inmediato pregúntate: «¿Puede realmente dejar de haber desvergonzados en el mundo?» No es posible. No pidas, pues, imposibles, porque ése es uno de aquellos desvergonzados que necesariamente debe existir en el mundo. Ten a mano también esta consideración respecto a un malvado, a una persona desleal y respecto a todo tipo de delincuente. Pues, en el preciso momento que recuerdes que la estirpe de gente así es imposible que no exista, serás más benévolo con cada uno en particular. Útil es también pensar en seguida qué virtud concedió la naturaleza al hombre para remediar esos fallos. Pues, como antídoto contra el insensato, concedió la mansedumbre, y contra otro, otra virtud. Y, en suma, tienes posibilidad de encauzar con tus enseñanzas al descarriado, porque todo pecador se desvía y falla su objetivo y anda sin rumbo. ¿Y en qué has sido perjudicado? Porque a ninguno de esos con los que te exasperas, encontrarás, a ninguno que te haya hecho un daño tal que tu inteligencia llegue a ser peor. Y tu mal y tu daño tienen ahí su fundamento.""",

    # === LIBRO 10 ===
    (10, 1): """¿Llegarás algún día, alma mía, a ser buena, sencilla, única, desnuda, más visible que el cuerpo que te circunda? ¿Gustarás algún día la disposición de amar y querer? ¿Llegarás algún día a estar colmada, a no sentir falta de nada, a no echar de menos nada, a no desear nada, ni animado ni inanimado, para gozar de los placeres? ¿Ni tiempo en el que gozarás más largo, ni lugar o país o buen clima o buena concordancia entre los hombres? ¿Sino que te contentarás con la presente situación, te alegrarás con todas las cosas presentes y te convencerás de que todas tus cosas están a tu lado, de que te van bien y de que proceden de los dioses y de que todo cuanto les place y cuanto les plazca en el futuro dar, con vistas al bienestar del ser vivo perfecto, bueno, justo y hermoso que engendra, contiene, abarca y comprende todas las cosas que se disuelven para engendrar otras semejantes, te irá bien? ¿Llegarás algún día a ser tal que convivas con los dioses y con los hombres, hasta el extremo de no hacerles ninguna censura ni ser condenado por ellos?""",

    (10, 11): """¿Qué son en sí esas cosas que se te presentan ante ti? ¿Cuál es su naturaleza y su sustancia? ¿Cuál es la parte principal de cada una de ellas? ¿Por cuánto tiempo está determinado que subsistan? ¿Y qué virtud se les reclama, como la suavidad, el valor, la veracidad, la fidelidad, la sencillez, el bastarse a sí mismo, y otras semejantes?""",

    (10, 21): """Pronto la tierra nos cubrirá a todos. Luego también ella se transformará, y lo que surja de ella se transformará indefinidamente, y esto de nuevo indefinidamente. El que piensa en estas oleadas de cambios y transformaciones y su rapidez, despreciará todo lo mortal.""",

    (10, 30): """Cuando te ofenda el error de alguien, vuelve a ti mismo al punto y considera qué error semejante cometes tú también, como, por ejemplo, juzgar un bien el dinero, el placer, la vana gloria y cosas semejantes. Porque, con fijar tu atención en esto, rápidamente olvidarás la cólera, si además sobreviene esta reflexión: que se ve forzado. Pues, ¿qué va a hacer? O bien, si puedes, libérale de la violencia.""",

    (10, 6): """Sea la que sea la ocupación, obra sólida y esmeradamente como romano y como varón, con dignidad y humanidad, independencia y justicia, y ofrece asueto a tu alma libre de los demás pensamientos. Y lo conseguirás, si ejecutas cada acción como si fuese la última, alejado de toda irreflexión y de toda aversión apasionada que te aleje del dominio de la razón, y libre de fingimiento, de amor a ti mismo y de despecho respecto a lo que te ha tocado en suerte. Estás viendo cuán pocas son las cosas que se necesitan dominar para vivir una vida de curso favorable y piadosa. Porque tampoco los dioses exigirán más a quien observa esas cosas.""",

    (10, 33): """¿Qué te ocurre? ¿Cuál es la causa del mal que tienes? ¿Es el azar? Sopórtalo. ¿Es un hombre? Sé benévolo. ¿Es Dios? Venéralo. ¿Es tu infortunio? No cabe duda de que lo es. Pues de esos infortunios ninguno perjudica a la ley. Consecuentemente, lo que no perjudica a la ley, tampoco al ciudadano ni a la ciudad.""",

    (10, 37): """Habituarse a no desatender lo que el otro dice y, en la medida de lo posible, entrar en el alma del que habla. De lo que sucede en común, lo que no beneficia al panal, tampoco beneficia a la abeja. Si marineros o enfermos ultrajaran al piloto o al médico, ¿atenderían aquéllos a otra cosa que no fuera la salvación de los navegantes o la de los enfermos? ¿Cuántos de los que se jactaban conmigo han sido expulsados? Acepta todo, aunque sea difícil. Todo es habitual y efímero. En el momento de aproximarse a la muerte, con frecuencia es útil pedir cuentas en este sentido: ¿Qué disposición tiene el que habla respecto a cada uno? ¿No había hecho yo mismo lo mismo que ahora tanto me extraña que hagan los demás? No te irrites con él, ni te preguntes: ¿A dónde se fue? ¿Qué hace? Es ociosa curiosidad. Pero conviene, respecto a los falsos y perjuros y a los que parecen miserables en su propia estima, pasarles por alto, como a ciegos. Y a propósito de todas las cosas materiales, preguntarte: «¿Con qué fin promueve ése esta acción?» Empieza por ti mismo y a ti mismo en primer término examínate.""",

    (10, 32): """De la muerte de Sócrates: ¿Qué queréis? ¿El alma de un ser racional o irracional? De un ser racional. ¿De qué ser racional? ¿De uno sano o de uno perverso? De uno sano. ¿Por qué, entonces, no la buscáis? Porque la tenemos. ¿Por qué, entonces, luchamos y estamos divididos?""",

    # === LIBRO 11 ===
    (11, 20): """Tu hálito y todo lo ígneo, en tanto que forman parte de la mezcla, si bien por naturaleza tienden a elevarse, están, sin embargo, sumisos al orden del conjunto universal, contenidos aquí en la mezcla. Y todo lo terrestre y acuoso que se encuentra en ti, a pesar de que tiende hacia abajo, sin embargo, se levanta y mantiene en pie en una posición que no le es connatural. Así, pues, incluso los elementos obedecen al conjunto universal, una vez se les ha asignado un puesto en algún lugar, y allí permanecen hasta que desde aquel lugar sea indicada de nuevo la señal de disolución. ¿No es terrible, pues, que sólo tu parte intelectiva sea indócil y se indigne con la posición que se le ha asignado? Y en verdad nada violento se le asigna, sino exclusivamente todo aquello que es para esa parte intelectiva conforme a la naturaleza. Pero no sólo no lo tolera, sino que se encamina a lo contrario. Porque el movimiento que la incita a las injusticias, a los desenfrenos, a las cóleras, a las penas, a los temores, no es otra cosa que defección de la naturaleza. También cuando el guía interior está molesto con alguno de los acontecimientos, abandona entonces su puesto. Porque ha sido constituido con vistas a la piedad y el respeto a los dioses no menos que para la justicia. Porque estas virtudes constituyen y forman la sociabilidad y son más venerables que las acciones justas.""",

    (11, 22): """El ratón del monte y el doméstico; su temor y su turbación.""",

    (11, 27): """Los pitagóricos aconsejaban levantar los ojos al cielo al amanecer, a fin de que recordáramos a los que cumplen siempre según las mismas normas y de igual modo su tarea, y también su orden, su pureza y su desnudez; pues nada envuelve a los astros.""",

    (11, 33): """«Pretender un higo en invierno es de locos. Tal es el que busca un niño, cuando todavía no se le ha dado.»""",

    (11, 36): """«No se llega a ser bandido por libre designio.» La máxima es de Epicteto.""",

    (11, 6): """En primer lugar, fueron escenificadas las tragedias como recuerdo de los acontecimientos humanos, y de que es natural que éstos sucedan así, y también para que no os apesadumbréis en la escena mayor con los dramas que os han divertido en la escena. Porque se ve la necesidad de que esto acabe así, y que lo soportan quienes gritan: «¡Oh Citerón!». Y dicen los autores de dramas algunas máximas útiles. Por ejemplo, sobre todo, aquella de: «Si mis hijos y yo hemos sido abandonados por los dioses, también eso tiene su justificación.» Y esta otra: «No irritarse con los hechos.» Y: «Cosechad la vida como una espiga granada.» y otras tantas máximas semejantes. Y después de la tragedia, se representó la comedia antigua, que contiene una libertad de expresión adecuada para la educación gracias a su franqueza, y que de manera provechosa acostumbraba a la sencillez de estilo. Pero, ¿a qué objetivo apuntó el proyecto total de esta poesía y arte dramático?""",

    (11, 18): """Y en primer lugar, qué relación me vincula a ellos, que hemos nacido los unos para los otros, y yo personalmente he nacido, por otra razón, para ponerme al frente de ellos, como el carnero está al frente del rebaño y el toro al frente de la vacada. Y remóntate más arriba partiendo de esta consideración: «Si no son los átomos, es la naturaleza la que gobierna el conjunto universal.» Si es así, los seres inferiores por causa de los superiores, y éstos, los unos para los otros. Y en segundo lugar, cómo se comportan en la mesa, en la cama y en lo demás. Y sobre todo, qué necesidades tienen procedentes de sus principios, y eso mismo, ¡con qué arrogancia lo cumplen! En tercer lugar, que, si con rectitud hacen esto, no hay que molestarse, pero si no es así, evidentemente lo hacen contra su voluntad y por ignorancia. Porque toda alma se priva contra su voluntad tanto de la verdad como también de comportarse en cada cosa según su valor. Por consiguiente, les pesa oírse llamados injustos, insensatos, ambiciosos y, en una palabra, capaces de faltar al prójimo. En cuarto lugar, que también tú faltas muchas veces, y eres otro tal, y aunque te abstengas de ciertas faltas, tienes disposición a ellas, incluso si te abstienes de esas faltas por cobardía, por reputación, o por cualquier otro vicio semejante. En quinto lugar, que ni siquiera estás seguro de si faltan, pues muchas cosas se hacen por conveniencia. En suma, hay muchas cosas que previamente aprender para poder pronunciarse sobre los actos ajenos. En sexto lugar, siempre que te exasperes o indignes en demasía, piensa que la vida humana dura un instante; y en poco tiempo todos estaremos acostados. En séptimo lugar, que no son sus acciones las que nos turban, pues éstas tienen su fundamento en sus guías interiores, sino nuestras opiniones. Suprime, pues, y resuelve desistir de tu juicio, como si se tratara de algo terrible, y tu cólera se habrá marchado. ¿Cómo lo suprimirás? Razonando que no es vergonzoso. Porque si lo vergonzoso no es lo único malo, tú también harás necesariamente muchos males, te convertirás en ladrón, y cometerás toda clase de delitos. En octavo lugar, cuanto nos provocan a la ira y aflicción por tales cosas, es mucho más penoso que aquellas mismas que nos provocan la ira y la aflicción. En noveno lugar, que la benevolencia es invencible, si es verdadera, no una sonrisa fingida e hipócrita. Porque, ¿qué te hará el hombre más insolente, si tú continúas siendo benévolo con él, y, si se te presenta la oportunidad, le exhortas suavemente y le das lecciones precisamente cuando esté en trance de intentar hacerte daño? «No, hijo, hemos nacido para otra cosa. No temo que me dañes, eres tú quien te perjudica, hijo.» Y hazle ver, de manera discreta y general, que así es, que ni las abejas ni ninguno de los animales que por naturaleza son gregarios hacen eso. Pero conviene hacerlo sin ironía ni injuria, antes bien, afectuosamente y con el corazón libre de heridas; y no como en la escuela, ni para ser admirado por otro que asista, sino a solas con él, aunque haya otros presentes. Recuerda estos nueve capítulos como si de las Musas los hubieras recibido, y comienza de una vez a ser hombre mientras vivas. Debes evitar por igual la adulación y el enojarte con ellos; pues ambas cosas son contrarias a la sociabilidad y acarrean perjuicio. Y en los enfados, ten presente que la ira no es propia del hombre, sino que lo comedido y apacible, cuanto más humano, tanto más viril lo es. Eso posee fuerza, nervios, hombría; y no el que se indigna y rechaza. Porque cuanto más cercana a la impasibilidad, tanto más cercana al poder. Y así como el pesar es propio del débil, así también la ira. Ambos han sido heridos y ambos se rinden.""",

    # === LIBRO 12 ===
    (12, 1): """Todos los objetivos que deseas alcanzar en tu progreso puedes ya tenerlos si no te los regateas a ti mismo. Es decir: caso de que abandones todo el pasado, confíes a la providencia el porvenir y endereces el presente hacia la piedad y la justicia exclusivamente. Hacia la piedad, para que ames el destino que te ha sido asignado; pues la naturaleza te lo deparaba y tú eras el destinatario de esto. Hacia la justicia, a fin de que libremente y sin artilugios digas la verdad y hagas las cosas conforme a la ley y según su valor. No te obstaculice ni la maldad ajena, ni su opinión, ni su palabra, ni tampoco la sensación de la carne que recubre tu cuerpo. Pues eso incumbirá al cuerpo paciente. Si, pues, en el momento en que llegues a la salida, dejas todo lo demás y honras exclusivamente a tu guía interior y a la divinidad ubicada en ti; si temes no ya dejar de vivir, sino no haber empezado nunca a vivir conforme a la naturaleza, serás un hombre digno del mundo que te engendró y dejarás de ser un extraño a tu patria y dejarás también de admirar como cosas inesperadas los sucesos cotidianos, y de estar pendiente de esto y de aquello.""",

    (12, 12): """No debe censurarse a los dioses; porque ninguna falta cometen voluntaria o involuntariamente. Tampoco a los hombres, porque nada fallan que no sea contra su voluntad. De manera que a nadie debe censurarse.""",

    (12, 34): """Lo que más incita a despreciar la muerte es el hecho de que los que juzgan el placer un bien y el dolor un mal, la despreciaron, sin embargo, también.""",
}

def clean_ocr_artifacts(text):
    """Remove OCR artifacts from text."""
    # Fix Greek phi character in Spanish words
    text = text.replace('soφ', 'sor')
    text = text.replace('cueφ', 'cuerp')
    text = text.replace('φ', '')
    text = text.replace('fiiente', 'fuente')
    text = text.replace('rñe', 'me')

    # Remove MliDIT errors (including with spaces)
    text = re.sub(r'\s*MliDIT\s*A?\s*CIONli\s*S\s*', ' ', text)
    text = re.sub(r'\s*MliDITACIONLS\s*', ' ', text)
    text = re.sub(r'\s*Mlii:\)ITACK\)NLS\s*', ' ', text)
    text = re.sub(r'tambiénMliDIT\s*ACIONli\s*S', 'también', text)

    # Remove footnote content with LIBRO references and page numbers
    text = re.sub(r'LIBRO\s+[IVX]+\s*\d+\s*', '', text)
    text = re.sub(r'L\s*I\s*B\s*R\s*O\s+[IVX]+\s*\d*\s*', '', text)

    # Remove LIBRO references at end of text
    text = re.sub(r'\s*L\s*I\s*B\s*R\s*O\s+X+I*\s*$', '', text)
    text = re.sub(r'\s*LIBRO\s+[IVX]+\s*$', '', text)

    # Remove common footnote patterns
    text = re.sub(r'Palabras de [^\.]+\.\s*', '', text)
    text = re.sub(r'De igual modo procede [^\.]+\.\s*', '', text)
    text = re.sub(r'A\.\s*I\.\s*Trannoy[^\.]+\.\s*', '', text)
    text = re.sub(r'Farquharson[^\.]+\.\s*', '', text)
    text = re.sub(r'«mi hermano»[^\.]+\.\s*', '', text)

    # Remove page numbers at end
    text = re.sub(r'\s+\d{1,3}\s*$', '', text)

    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def main():
    print("Loading meditations...")
    data = load_meditations('/home/user/EstoicApp/src/data/meditations.json')

    fixes_made = 0
    cleanups_made = 0

    print("\nApplying corrections...")

    for meditation in data['meditations']:
        key = (meditation['book'], meditation['chapter'])
        old_text = meditation['text']

        # Check if we have a manual correction
        if key in CORRECTIONS:
            meditation['text'] = CORRECTIONS[key]
            fixes_made += 1
            print(f"Corrected Book {meditation['book']}, Chapter {meditation['chapter']}")
        else:
            # Try to clean OCR artifacts
            cleaned = clean_ocr_artifacts(old_text)
            if cleaned != old_text:
                meditation['text'] = cleaned
                cleanups_made += 1
                print(f"Cleaned Book {meditation['book']}, Chapter {meditation['chapter']}")

    print(f"\nTotal corrections: {fixes_made}")
    print(f"Total cleanups: {cleanups_made}")

    if fixes_made > 0 or cleanups_made > 0:
        print(f"\nSaving changes...")
        save_meditations('/home/user/EstoicApp/src/data/meditations.json', data)
        print("Done!")

if __name__ == '__main__':
    main()
