## Feature-List
* Create a user account for potential adopters and shelters
  1. Shelters:
     * Has authority to add pets to the database
     * Has access to all adoption requests for each pet, containing the adopters information to allow the shelter to reach out
  2. Adopters:
     * Create an 'ideal' pet that would 'match' to available pets
     * show matches with ideal pets near by
* match people with pets based on similar preferences and/or location
  1. simple matching algorithm:
     * find pets within a certain proximity (~25 miles)
     * loop through all categories of 'preferred pet' with available pets
     * get a percentage of the matched categories
     * display pets starting with the best match on down
  2. matching preferences will include:
     * pet age
     * pet breed
     * pet size
     * pet gender
     * good with: kids, other cats, other dogs
     * location (proximity of the person to the shelter)
* when an adopter has found a potential match, they can create an adoption request that would be sent the shelter for review


### Stretch-Goals
1. Rather than the shelters seeing a list of adoption requests, the shelter's available pets would show best matches to adopters, mimicking the adopting side
2. Real time messaging between shelter and adopter, rather than adoption requests