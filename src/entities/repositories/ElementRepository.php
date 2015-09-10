<?php
namespace MyApp\Entities\Repositories;
use Doctrine\ORM\EntityRepository;

/**
 * Created by PhpStorm.
 * User: david
 * Date: 09/09/15
 * Time: 15:47
 */
class ElementRepository extends EntityRepository {
	public function findInCircle($layer, $x, $y, $radius) {
		$query = $this->getEntityManager()->createQuery("SELECT el FROM :Element el WHERE ST_Intersects(ST_Transform(".
		"el.geom,3857),ST_Buffer(ST_SetSRID(ST_Point( :x, :y),3857), :radius)) = true AND el.layer = :layer");
		$query->setParameters(array(
			'x'=>$x,
			'y'=>$y,
			'radius'=>$radius*10,
			'layer'=>$layer
		));
		return $query->getResult();
	}

}
