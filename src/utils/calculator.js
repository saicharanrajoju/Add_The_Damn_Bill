export function calculateSplits(items, people, assignments) {
  // assignments is a map: { itemId: [person1_id, person2_id] }
  // people is an array of objects {id, name}

  // 1. Calculate each person's exact subtotal based on assigned items
  const personSubtotals = {};
  
  // Initialize
  people.forEach(p => {
    personSubtotals[p.id] = 0;
  });

  // Keep track of item-level breakdown for the UI Table
  const itemBreakdown = [];
  let grandTotal = 0;

  items.forEach(item => {
    const assignedPeople = assignments[item.id] || [];
    if (assignedPeople.length > 0) {
      // Split cost equally among assigned people
      const splitCost = item.price / assignedPeople.length;
      
      const sharingNames = assignedPeople.map(personId => {
        const person = people.find(p => p.id === personId);
        return person ? person.name : 'Unknown';
      });

      itemBreakdown.push({
        name: item.name,
        price: item.price,
        sharingNames: sharingNames,
        costPerPerson: splitCost
      });
      
      assignedPeople.forEach(personId => {
        personSubtotals[personId] += splitCost;
        grandTotal += splitCost;
      });
    } else {
      itemBreakdown.push({
        name: item.name,
        price: item.price,
        sharingNames: [],
        costPerPerson: 0
      });
    }
  });

  const participantTotals = people.map(person => {
    return {
      id: person.id,
      name: person.name,
      total: personSubtotals[person.id]
    };
  });

  return {
    itemBreakdown,
    participantTotals,
    grandTotal
  };
}
