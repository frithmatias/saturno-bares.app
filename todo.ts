//todo:
//Modos: ASIGNACIÓN MIXTA / ASIGNACIÓN MANUAL / SIN ASIGNACIÓN 


// COLA VIRTUAL (ASIGNACIÓN Y APROVISIONAMIENTO DE MESAS)
// 1. COLA VIRTUAL: ACTIVADA
// ---------------------------------------------------------------------
// ASINGACIÓN AUTOMÁTICA: El sistema ASIGNA Y PROVISIONA, sinembargo, el camarero PUEDE hacer siempre 
// una asignación manual, tomando a un cliente de la fila virtual para asignarle una mesa manualmente. 

// 1. BUSCA TICKET 'ASSIGNED' PRIORITARIO
// 2. BUSCA TICKET 'QUEUED' EN ORDEN FIFO QUE CUMPLA CON CARACTERÍSTICAS DE LA MESA LIBERADA, LO ASIGNA Y LO PROVISIONA.
// [8]IDLE -> SPM       -> 1[8] 2[?] 3[?] 4[3] 5[?] 6[?] 7[5]
// SYSTEM               ->   +
// WAITER ASSIGNMENT    ->                  +              +     


// ---------------------------------------------------------------------
// ASIGNACION MANUAL: El sistema NO ASIGNA SOLO PROVISIONA, el camarero DEBE hacer siempre una asignación manual, 
// tomando a un cliente de la fila virtual para asignarle una mesa manualmente.

// 1. BUSCA TICKETS 'ASSIGNED' PRIORITARIOS
// 2. BUSCA TICKETS 'ASSIGNED' EN ORDEN FIFO QUE CUMPLA CON CARACTERÍSTICAS DE LA MESA LIBERADA, SOLO LO PROVISIONA.
// IDLE -> SPM          -> 1[?] 2[?] 3[?] 4[3] 5[?] 6[?] 7[5]
// WAITER ASSIGNMENT    ->                  +              +     

// 2. COLA VIRTUAL Y APROVISIONAMIENTO: DESACTIVADA
// ---------------------------------------------------------------------
// No existe cola virtual, asignación ni provisión de mesas, tampoco estan disponibles 
// las herramientas de asignación manual. Los clientes sólo ingresan al comercio y piden una mesa o se sientan directamente 
// en ellas, el camarero DEBE cambiar el estado de la mesa manualmente.  








// TICKET QUEUE / REQUIRED / ASSIGNED / PROVIDED 
// TABLE IDLE / PAUSED / BUSY 

