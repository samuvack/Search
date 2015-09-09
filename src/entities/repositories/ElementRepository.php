<?php
namespace MyApp\Entities\Repositories;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\ResultSetMapping;

/**
 * Created by PhpStorm.
 * User: david
 * Date: 09/09/15
 * Time: 15:47
 */
class ElementRepository extends EntityRepository {

	/*
	 * Attention, dead entity:dont try to access layers
	 */
	public function findInCircle($layer, $x, $y, $radius) {
		$rsm = new ResultSetMapping();
		$rsm->addEntityResult(':Element','ent');
		$rsm->addFieldResult('ent','id','id');
		$rsm->addFieldResult('ent', 'name', 'name');
		$rsm->addFieldResult('ent', 'summary_nl', 'summary_nl');

		$query = $this->_em->createNativeQuery("SELECT ent.name, ent.id, ent.summary_nl FROM website_entities as ent  WHERE ".
			"st_intersects(st_transform(ent.geom,3857),st_buffer(st_setsrid(st_point(".$x.",".$y."),3857),"
			.($radius*10).")) AND ent.origin_table = '".$layer->getTable()."'", $rsm);
		$result = $query->getResult();
		return $result;

	}

}
